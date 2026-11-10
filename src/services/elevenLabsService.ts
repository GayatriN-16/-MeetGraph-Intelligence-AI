import fs from 'fs';
import path from 'path';

export interface ElevenLabsWord {
  text: string;
  start: number;
  end: number;
  type?: string;
  speaker_id?: string;
}

export interface ElevenLabsResponse {
  text: string;
  words?: ElevenLabsWord[];
  language_code?: string;
  language_probability?: number;
}

export interface TranscribeChunk {
  timecode: string;
  seconds: number;
  speaker: string;
  text: string;
}

export class ElevenLabsService {
  private getApiKey(overrideKey?: string): string {
    return (overrideKey || process.env.ELEVENLABS_API_KEY || '').trim();
  }

  public isConfigured(overrideKey?: string): boolean {
    return Boolean(this.getApiKey(overrideKey));
  }

  /**
   * Transcribe an audio file using ElevenLabs Scribe API (speech-to-text)
   * with diarization and word-level timestamps.
   */
  public async transcribeAudioFile(
    filePath: string,
    overrideKey?: string
  ): Promise<{ success: boolean; transcript: TranscribeChunk[]; fullText: string; provider: string; error?: string }> {
    const apiKey = this.getApiKey(overrideKey);
    if (!apiKey) {
      return { 
        success: false, 
        transcript: [], 
        fullText: '', 
        provider: 'ElevenLabs Scribe', 
        error: 'ElevenLabs API key is not configured.' 
      };
    }

    if (!fs.existsSync(filePath)) {
      return { 
        success: false, 
        transcript: [], 
        fullText: '', 
        provider: 'ElevenLabs Scribe', 
        error: `Audio file not found: ${filePath}` 
      };
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = ext === '.mp3' ? 'audio/mpeg' : ext === '.m4a' ? 'audio/mp4' : 'audio/wav';

      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('file', blob, path.basename(filePath));
      formData.append('model_id', 'scribe_v1');
      formData.append('diarize', 'true');
      formData.append('tag_audio_events', 'true');

      console.log(`[ElevenLabs Scribe] Sending audio file (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB) to speech-to-text API...`);

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[ElevenLabs Scribe] API error (${response.status}):`, errorText);
        return {
          success: false,
          transcript: [],
          fullText: '',
          provider: 'ElevenLabs Scribe',
          error: `ElevenLabs API error (${response.status}): ${errorText.substring(0, 180)}`
        };
      }

      const data = (await response.json()) as ElevenLabsResponse;
      const fullText = (data.text || '').trim();

      if (!fullText) {
        return {
          success: false,
          transcript: [],
          fullText: '',
          provider: 'ElevenLabs Scribe',
          error: 'ElevenLabs detected no audible dialogue in the recording.'
        };
      }

      // Format words & diarized segments into structured chunks
      const chunks = this.formatDiarizedWords(data.words, fullText);

      console.log(`[ElevenLabs Scribe] Transcribed ${chunks.length} chunks (${fullText.length} characters) successfully!`);

      return {
        success: true,
        transcript: chunks,
        fullText,
        provider: 'ElevenLabs Scribe'
      };
    } catch (err: any) {
      console.error('[ElevenLabs Scribe] Transcription exception:', err);
      return {
        success: false,
        transcript: [],
        fullText: '',
        provider: 'ElevenLabs Scribe',
        error: err.message || 'ElevenLabs network error'
      };
    }
  }

  private formatDiarizedWords(words: ElevenLabsWord[] | undefined, fallbackText: string): TranscribeChunk[] {
    if (!words || words.length === 0) {
      // Split fallback text into sentence chunks
      const sentences = fallbackText.match(/[^.!?]+[.!?]+/g) || [fallbackText];
      return sentences.map((sentence, idx) => {
        const sec = idx * 12;
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return {
          timecode: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
          seconds: sec,
          speaker: `Speaker ${(idx % 2) + 1}`,
          text: sentence.trim()
        };
      });
    }

    const chunks: TranscribeChunk[] = [];
    let currentSpeaker = '';
    let currentTextWords: string[] = [];
    let currentStartSec = 0;

    const speakerMap: Record<string, string> = {};
    let speakerCount = 0;

    const getSpeakerLabel = (rawId?: string) => {
      if (!rawId) return 'Speaker 1';
      if (!speakerMap[rawId]) {
        speakerCount += 1;
        speakerMap[rawId] = `Speaker ${speakerCount}`;
      }
      return speakerMap[rawId];
    };

    for (const w of words) {
      const spk = getSpeakerLabel(w.speaker_id);
      const isNewSpeaker = currentSpeaker !== '' && spk !== currentSpeaker;
      const isLongPause = currentTextWords.length > 0 && (w.start - currentStartSec > 20);

      if (isNewSpeaker || isLongPause) {
        if (currentTextWords.length > 0) {
          const mins = Math.floor(currentStartSec / 60);
          const secs = Math.floor(currentStartSec % 60);
          chunks.push({
            timecode: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
            seconds: Math.floor(currentStartSec),
            speaker: currentSpeaker || 'Speaker 1',
            text: currentTextWords.join(' ').trim()
          });
        }
        currentSpeaker = spk;
        currentStartSec = w.start || 0;
        currentTextWords = [w.text];
      } else {
        if (currentTextWords.length === 0) {
          currentSpeaker = spk;
          currentStartSec = w.start || 0;
        }
        currentTextWords.push(w.text);
      }
    }

    if (currentTextWords.length > 0) {
      const mins = Math.floor(currentStartSec / 60);
      const secs = Math.floor(currentStartSec % 60);
      chunks.push({
        timecode: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
        seconds: Math.floor(currentStartSec),
        speaker: currentSpeaker || 'Speaker 1',
        text: currentTextWords.join(' ').trim()
      });
    }

    return chunks;
  }
}

export const elevenLabsService = new ElevenLabsService();

