// TTS via OpenAI — copied from elitetutor-master server/_core/tts.ts

interface GenerateSpeechParams {
  text: string;
  voice?: 'onyx' | 'alloy' | 'echo' | 'fable' | 'nova' | 'shimmer';
  speed?: number;
}

export async function generateSpeech(params: GenerateSpeechParams): Promise<{ audioBase64: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: params.text,
      voice: params.voice || 'onyx',
      speed: params.speed || 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TTS API error: ${response.status} ${error}`);
  }

  const buffer = await response.arrayBuffer();
  const audioBase64 = Buffer.from(buffer).toString('base64');
  return { audioBase64 };
}
