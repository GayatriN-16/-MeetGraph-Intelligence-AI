
from pathlib import Path
from threading import Lock

from faster_whisper import WhisperModel


MODEL_SIZE = "base"
DEVICE = "cpu"
COMPUTE_TYPE = "int8"

_model = None
_model_lock = Lock()


def get_whisper_model():
    global _model

    if _model is None:
        with _model_lock:
            if _model is None:
                _model = WhisperModel(
                    MODEL_SIZE,
                    device=DEVICE,
                    compute_type=COMPUTE_TYPE,
                )

    return _model


def transcribe_recording(
    audio_path: str,
    language: str | None = None,
) -> dict:
    path = Path(audio_path)

    if not path.is_file():
        raise FileNotFoundError("Meeting recording was not found.")

    model = get_whisper_model()

    segments, info = model.transcribe(
        str(path),
        language=language,
        beam_size=1,
        vad_filter=True,
        word_timestamps=False,
    )

    results = []

    for segment in segments:
        text = segment.text.strip()

        if not text:
            continue

        results.append({
            "start_seconds": float(segment.start),
            "end_seconds": float(segment.end),
            "text": text,
            "confidence": (
                float(segment.avg_logprob)
                if segment.avg_logprob is not None
                else None
            ),
        })

    return {
        "language": info.language,
        "language_probability": float(info.language_probability),
        "duration_seconds": float(info.duration),
        "segments": results,
    }
