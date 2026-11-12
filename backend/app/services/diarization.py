
from pathlib import Path
from threading import Lock

from app.core.config import settings


MODEL_ID = "pyannote/speaker-diarization-community-1"
TARGET_SAMPLE_RATE = 16000

_pipeline = None
_pipeline_lock = Lock()


def get_diarization_pipeline():
    """Load Pyannote only when diarization is requested."""
    global _pipeline

    if not settings.HF_TOKEN:
        raise RuntimeError(
            "Hugging Face token is not configured."
        )

    if _pipeline is None:
        with _pipeline_lock:
            if _pipeline is None:
                import torch
                from pyannote.audio import Pipeline

                pipeline = Pipeline.from_pretrained(
                    MODEL_ID,
                    token=settings.HF_TOKEN,
                )

                if pipeline is None:
                    raise RuntimeError(
                        "Could not load the pyannote diarization model."
                    )

                pipeline.to(torch.device("cpu"))
                _pipeline = pipeline

    return _pipeline


def load_audio_waveform(audio_path: str):
    """
    Decode audio using PyAV instead of TorchCodec.
    Convert it to mono, 16 kHz float32 audio.
    """
    import av
    import numpy as np
    import torch

    chunks = []

    with av.open(audio_path) as container:
        if not container.streams.audio:
            raise RuntimeError(
                "No audio stream found in recording."
            )

        audio_stream = container.streams.audio[0]

        resampler = av.AudioResampler(
            format="fltp",
            layout="mono",
            rate=TARGET_SAMPLE_RATE,
        )

        for frame in container.decode(
            audio=audio_stream.index
        ):
            converted_frames = resampler.resample(frame)

            for converted in converted_frames:
                samples = converted.to_ndarray().astype(
                    np.float32,
                    copy=False,
                )
                chunks.append(samples)

        for converted in resampler.resample(None):
            samples = converted.to_ndarray().astype(
                np.float32,
                copy=False,
            )
            chunks.append(samples)

    if not chunks:
        raise RuntimeError(
            "Audio decoding produced no samples."
        )

    waveform = np.concatenate(chunks, axis=1)
    waveform = np.ascontiguousarray(waveform)

    return torch.from_numpy(waveform)


def diarize_recording(audio_path: str) -> dict:
    """
    Detect anonymous speaker turns using Pyannote.
    Audio is decoded by PyAV to avoid TorchCodec file loading.
    """
    path = Path(audio_path)

    if not path.is_file():
        raise FileNotFoundError(
            "Meeting recording was not found."
        )

    waveform = load_audio_waveform(str(path))
    pipeline = get_diarization_pipeline()

    output = pipeline({
        "waveform": waveform,
        "sample_rate": TARGET_SAMPLE_RATE,
    })

    annotation = getattr(
        output,
        "speaker_diarization",
        None,
    )

    if annotation is None:
        raise RuntimeError(
            "The diarization pipeline returned no speaker annotations."
        )

    turns = []

    for segment, _, speaker_label in annotation.itertracks(
        yield_label=True
    ):
        start = float(segment.start)
        end = float(segment.end)

        if end <= start:
            continue

        turns.append({
            "start_seconds": start,
            "end_seconds": end,
            "speaker_label": str(speaker_label),
        })

    turns.sort(
        key=lambda item: item["start_seconds"]
    )

    labels = sorted({
        turn["speaker_label"]
        for turn in turns
    })

    return {
        "model": MODEL_ID,
        "device": "cpu",
        "speaker_count": len(labels),
        "speakers": labels,
        "turns": turns,
    }


def match_segments_to_speakers(
    transcript_segments: list,
    speaker_turns: list[dict],
    minimum_overlap_ratio: float = 0.2,
) -> list[str | None]:
    """Match Whisper segments to speakers using temporal overlap."""

    assignments = []

    for transcript in transcript_segments:
        transcript_start = float(
            transcript.start_seconds
        )
        transcript_end = float(
            transcript.end_seconds
        )

        transcript_duration = (
            transcript_end - transcript_start
        )

        if transcript_duration <= 0:
            assignments.append(None)
            continue

        overlap_by_speaker = {}

        for turn in speaker_turns:
            overlap = max(
                0.0,
                min(
                    transcript_end,
                    turn["end_seconds"],
                )
                - max(
                    transcript_start,
                    turn["start_seconds"],
                ),
            )

            if overlap > 0:
                label = turn["speaker_label"]

                overlap_by_speaker[label] = (
                    overlap_by_speaker.get(label, 0.0)
                    + overlap
                )

        if not overlap_by_speaker:
            assignments.append(None)
            continue

        ranked = sorted(
            overlap_by_speaker.items(),
            key=lambda item: item[1],
            reverse=True,
        )

        best_label, best_overlap = ranked[0]

        if (
            best_overlap / transcript_duration
            < minimum_overlap_ratio
        ):
            assignments.append(None)
            continue

        if (
            len(ranked) > 1
            and abs(ranked[0][1] - ranked[1][1]) < 0.05
        ):
            assignments.append(None)
            continue

        assignments.append(best_label)

    return assignments
