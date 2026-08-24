// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Loaded from .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse):Promise<void> {
  if (req.method === 'POST') {
    try {
      const { messages, stream = false } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Valid, efficient model
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' }, // Optional context
          ...messages,
        ],
        max_tokens: 500, // Cost/response control
        temperature: 0.7,
        stream: stream,
      });

      if (stream) {
        // Streaming: Pages Router supports it via res.write(), but it's trickier—skip for now or implement below
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of completion as any) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(content);
          }
        }
        res.end();
        return;
      }

      const response = completion.choices[0]?.message?.content || '';
      res.status(200).json({ response });
    } catch (err: any) {
      console.error('OpenAI Error:', err);
      res.status(500).json({ error: err.message || 'Something went wrong' });
    }
  } else if (req.method === 'GET') {
    try {
      const message = req.query.q as string;
      if (!message) {
        return res.status(400).json({ error: 'Missing query ?q=' });
      }

      // Reuse POST logic
      const postBody = { messages: [{ role: 'user', content: message }] };
      req.body = postBody; // Mock body for reuse (simple hack)
      return handler({ ...req, method: 'POST' } as NextApiRequest, res); // Recursive call
    } catch (err: any) {
      console.error('GET Error:', err);
      res.status(500).json({ error: err.message || 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}