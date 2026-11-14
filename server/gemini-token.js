import { GoogleGenAI } from '@google/genai';

export async function createLiveToken({ apiKey, model = 'gemini-3.8-live' } = {}) {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  const client = new GoogleGenAI({ apiKey });
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime: expiresAt,
      liveConnectConstraints: {
        model,
        config: {
          sessionResumption: {},
          responseModalities: ['AUDIO'],
        },
      },
    },
  });
  return { token: token.name, expiresAt, model };
}
