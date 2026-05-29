// Storage via Manus Forge — copied from elitetutor-master server/storage.ts

export async function storagePut(
  key: string,
  data: Buffer | string,
  contentType: string,
): Promise<{ key: string; url: string }> {
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL || 'https://forge.manus.im/v1';

  const body = typeof data === 'string' ? Buffer.from(data) : data;
  const base64 = body.toString('base64');

  const response = await fetch(`${apiUrl}/storage/put`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ key, data: base64, contentType }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Storage put error: ${response.status} ${error}`);
  }

  const result = await response.json();
  return { key, url: result.url };
}

export async function storageGet(key: string): Promise<{ key: string; url: string }> {
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL || 'https://forge.manus.im/v1';

  const response = await fetch(`${apiUrl}/storage/get?key=${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Storage get error: ${response.status} ${error}`);
  }

  const result = await response.json();
  return { key, url: result.url };
}
