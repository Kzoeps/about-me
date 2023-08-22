import { kv } from '@vercel/kv'

export const config = {
  runtime: 'edge'
}

export default async function handler(request) {
  const data = await request.json();
  const id = `posties:${data.id}`
  const res = await kv.hgetall(id)
  return new Response(JSON.stringify(res), {status:200})
}
