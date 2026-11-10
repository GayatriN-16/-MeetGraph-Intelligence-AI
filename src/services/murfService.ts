import fs from 'fs';

export interface MurfChunk {
  timecode: string;
  seconds: number;
  speaker: string;
  text: string;
}

export class MurfService {
  private getApiKey(overrideKey?: string): string {
    return (overrideKey || process.env.MURF_API_KEY || '').trim();
  }

  public isConfigured(overrideKey?: string): boolean {
    return Boolean(this.getApiKey(overrideKey));
  }

  /**
   * Transcribe a 16kHz mono WAV audio file using Murf Speech-to-Text Streaming WebSocket API
   */
  public async transcribeAudioFile(
    filePath: string,
    overrideKey?: string
  ): Promise<{ success: boolean; transcript: MurfChunk[]; fullText: string; error?: string }> {
    const apiKey = this.getApiKey(overrideKey);
    if (!apiKey) {
      return { success: false, transcript: [], fullText: '', error: 'Murf API key is not configured.' };
    }

    if (!fs.existsSync(filePath)) {
      return { success: false, transcript: [], fullText: '', error: `Audio file not found: ${filePath}` };
    }

    return new Promise((resolve) => {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        // If it's a WAV file, raw PCM starts after 44-byte RIFF header
        const pcmData = fileBuffer.length > 44 && fileBuffer.toString('ascii', 0, 4) === 'RIFF'
          ? fileBuffer.subarray(44)
          : fileBuffer;

        const url = `wss://us-east.api.murf.ai/v1/transcription/stream-input?api_key=${apiKey}&model=finch_global_1.0&language=auto`;
        console.log('[Murf STT] Connecting to Murf Speech-to-Text WebSocket API...');

        const ws = new WebSocket(url);
        const accumulatedTranscripts: string[] = [];
        let isResolved = false;

        const cleanupAndResolve = (result: { success: boolean; transcript: MurfChunk[]; fullText: string; error?: string }) => {
          if (!isResolved) {
            isResolved = true;
            try { ws.close(); } catch (e) {}
            resolve(result);
          }
        };

        const timeout = setTimeout(() => {
          const fullText = accumulatedTranscripts.join(' ').trim();
          if (fullText) {
            cleanupAndResolve({
              success: true,
              transcript: this.buildChunks(fullText),
              fullText
            });
          } else {
            cleanupAndResolve({
              success: false,
              transcript: [],
              fullText: '',
              error: 'Murf STT timed out waiting for speech response.'
            });
          }
        }, 15000);

        ws.onopen = async () => {
          console.log('[Murf STT] WebSocket connected. Sending AudioConfig...');
          ws.send(JSON.stringify({
            type: 'AudioConfig',
            codec: 'pcm_s16le',
            sample_rate: 16000,
            channels: 1
          }));

          // Stream audio in 3200-byte chunks (~100ms per frame)
          const chunkSize = 3200;
          for (let offset = 0; offset < pcmData.length; offset += chunkSize) {
            if (ws.readyState !== WebSocket.OPEN) break;
            const slice = pcmData.subarray(offset, Math.min(offset + chunkSize, pcmData.length));
            ws.send(slice);
            if (offset % (chunkSize * 8) === 0) {
              await new Promise(r => setTimeout(r, 8));
            }
          }

          console.log('[Murf STT] Finished streaming audio frames, awaiting transcription response...');
          
          setTimeout(() => {
            clearTimeout(timeout);
            const fullText = accumulatedTranscripts.join(' ').trim();
            if (fullText) {
              cleanupAndResolve({
                success: true,
                transcript: this.buildChunks(fullText),
                fullText
              });
            } else {
              cleanupAndResolve({
                success: false,
                transcript: [],
                fullText: '',
                error: 'Murf STT: No speech detected in audio stream.'
              });
            }
          }, 2500);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data.toString());
            const text = data.transcript || data.text || (data.data && (data.data.transcript || data.data.text));
            if (text && typeof text === 'string' && text.trim()) {
              console.log(`[Murf STT] Transcript chunk received: "${text.trim().substring(0, 60)}..."`);
              accumulatedTranscripts.push(text.trim());
            }
          } catch (e) {
            // Not a JSON message
          }
        };

        ws.onerror = (err) => {
          console.warn('[Murf STT] WebSocket error:', (err as any).message || err);
          clearTimeout(timeout);
          cleanupAndResolve({
            success: false,
            transcript: [],
            fullText: '',
            error: 'Murf STT WebSocket error'
          });
        };

      } catch (err: any) {
        console.error('[Murf STT] Exception during transcription:', err);
        resolve({
          success: false,
          transcript: [],
          fullText: '',
          error: err.message || 'Murf STT exception'
        });
      }
    });
  }

  private buildChunks(fullText: string): MurfChunk[] {
    const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
    return sentences.map((s, idx) => {
      const sec = idx * 10;
      const mins = Math.floor(sec / 60);
      const secs = sec % 60;
      return {
        timecode: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
        seconds: sec,
        speaker: `Speaker ${(idx % 2) + 1}`,
        text: s.trim()
      };
    });
  }
}

export const murfService = new MurfService();

