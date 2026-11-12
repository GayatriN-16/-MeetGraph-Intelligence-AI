
from app.services.diarization import diarize_recording

AUDIO_PATH = "storage/uploads/meetgraph_test.mp4"


def main():
    print("\nLoading speaker diarization model...")

    result = diarize_recording(AUDIO_PATH)

    print("\n--- DIARIZATION RESULTS ---")
    print("Model:", result["model"])
    print("Speakers:", result["speakers"])
    print("Speaker count:", result["speaker_count"])
    print("Total turns:", len(result["turns"]))

    for turn in result["turns"]:
        start = turn["start_seconds"]
        end = turn["end_seconds"]
        speaker = turn["speaker_label"]

        print(f"{start:.2f}s - {end:.2f}s | {speaker}")


if __name__ == "__main__":
    main()
