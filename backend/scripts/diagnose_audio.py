
import av
import numpy as np

from app.core.database import SessionLocal
from app.models import Meeting


MEETING_ID = 2


def main():
    db = SessionLocal()

    try:
        meeting = db.get(Meeting, MEETING_ID)

        if not meeting:
            print("Meeting not found.")
            return

        print("\n--- MEETING DETAILS ---")
        print("Title:", meeting.title)
        print("Filename:", meeting.original_filename)
        print("Duration in database:", meeting.duration_seconds)
        print("File exists:", __import__("pathlib").Path(
            meeting.storage_path
        ).is_file())

        print("\n--- MEDIA STREAM INSPECTION ---")

        container = av.open(meeting.storage_path)

        print("Container duration:", container.duration)

        audio_streams = list(container.streams.audio)
        video_streams = list(container.streams.video)

        print("Audio streams:", len(audio_streams))
        print("Video streams:", len(video_streams))

        if not audio_streams:
            print("\nERROR: No audio stream found in this recording.")
            return

        audio_stream = audio_streams[0]

        print("Audio codec:", audio_stream.codec_context.name)
        print("Sample rate:", audio_stream.codec_context.sample_rate)
        print("Channels:", audio_stream.codec_context.channels)

        total_frames = 0
        total_samples = 0
        peak_level = 0.0
        squared_sum = 0.0

        for frame in container.decode(audio=0):
            samples = frame.to_ndarray().astype(np.float64)

            if samples.size == 0:
                continue

            total_frames += 1
            total_samples += samples.size

            peak_level = max(
                peak_level,
                float(np.max(np.abs(samples))),
            )

            squared_sum += float(np.sum(samples ** 2))

        if total_samples == 0:
            print("\nERROR: Audio stream contains no decoded samples.")
            return

        rms = np.sqrt(squared_sum / total_samples)

        print("\n--- AUDIO ANALYSIS ---")
        print("Decoded frames:", total_frames)
        print("Decoded samples:", total_samples)
        print("Peak amplitude:", peak_level)
        print("RMS amplitude:", rms)

        if peak_level < 0.001:
            print("WARNING: Audio appears silent or extremely quiet.")
        else:
            print("Audio samples are present.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
