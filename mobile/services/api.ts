// Update API_URL to your deployed Deathcon API endpoint.
// For local dev: 'http://localhost:8000'
// For production: 'https://your-app.onrender.com'
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface ChatResponse {
  response: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function sendMessage(
  message: string,
  systemPrompt: string,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      context: systemPrompt,
      model: 'claude',
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new APIError(body.detail ?? 'Request failed', res.status);
  }

  return res.json() as Promise<ChatResponse>;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
