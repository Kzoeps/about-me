import { kv } from '@vercel/kv'

export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const posties = await kv.smembers('posties')
  return new Response(
    JSON.stringify(posties), {status:200, headers: { 'content-type': 'application/json' } }
  );
}


