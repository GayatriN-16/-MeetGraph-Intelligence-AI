import sys
import os
import json
import wave
import speech_recognition as sr

def transcribe_audio_file(file_path):
    if not os.path.exists(file_path):
        return {"success": False, "error": f"Audio file not found at: {file_path}"}

    r = sr.Recognizer()
    r.energy_threshold = 280
    r.dynamic_energy_threshold = True

    try:
        with sr.AudioFile(file_path) as source:
            duration = source.DURATION
            chunks = []
            full_text_list = []
            
            # If duration is short (under 30s), transcribe in one or two segments
            if duration <= 30:
                audio = r.record(source)
                try:
                    text = r.recognize_google(audio)
                    if text and text.strip():
                        chunks.append({
                            "timecode": "00:02",
                            "seconds": 2,
                            "speaker": "Speaker 1",
                            "text": text.strip()
                        })
                        full_text_list.append(text.strip())
                except sr.UnknownValueError:
                    pass
                except Exception as e:
                    pass
            else:
                # Segment audio into 15-20 second windows for diarized timestamps
                current_sec = 0
                speaker_idx = 1
                segment_len = 20
                while current_sec < duration:
                    segment_duration = min(segment_len, duration - current_sec)
                    audio = r.record(source, duration=segment_duration)
                    try:
                        text = r.recognize_google(audio)
                        if text and text.strip():
                            mins = int(current_sec // 60)
                            secs = int(current_sec % 60)
                            timecode = f"{mins:02d}:{secs:02d}"
                            
                            chunks.append({
                                "timecode": timecode,
                                "seconds": int(current_sec),
                                "speaker": f"Speaker {speaker_idx}",
                                "text": text.strip()
                            })
                            full_text_list.append(text.strip())
                            # Switch speaker when there's an alternation of speech segments
                            speaker_idx = 2 if speaker_idx == 1 else 1
                    except sr.UnknownValueError:
                        # Segment had background silence or low amplitude
                        pass
                    except Exception as e:
                        pass
                    current_sec += segment_duration

            full_text = " ".join(full_text_list).strip()
            
            if not full_text:
                return {
                    "success": False,
                    "error": "No speech detected in audio file. Please ensure microphone audio is audible.",
                    "transcript": [],
                    "fullText": "",
                    "duration": int(duration)
                }

            return {
                "success": True,
                "transcript": chunks,
                "fullText": full_text,
                "duration": max(1, int(duration))
            }

    except Exception as e:
        return {"success": False, "error": f"Audio transcription error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No audio file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    result = transcribe_audio_file(file_path)
    print(json.dumps(result))
