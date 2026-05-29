// LLM via Manus Forge API — copied from elitetutor-master server/_core/llm.ts

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; [key: string]: any }>;
}

interface InvokeLLMParams {
  messages: Message[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function invokeLLM(params: InvokeLLMParams) {
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL || 'https://forge.manus.im/v1';

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: params.model || 'gemini-2.5-flash',
      messages: params.messages,
      max_tokens: params.maxTokens || 2048,
      temperature: params.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error: ${response.status} ${error}`);
  }

  return response.json();
}
