import { kv } from '@vercel/kv'

export const config = {
  runtime: 'edge'
}
export default async function handler(request) {
  const token = request.headers.get('Authorization');
  if (token !== process.env.TOKEN) {
    return new Response('unauthorized', {status:401});
  }
  const data = await request.json(); 
  const id = data.id
  await kv.sadd('posties', id)
  await kv.hset(`posties:${id}`, { id, content: data.content, left: data.left, top: data.top } )
  return new Response('success', {status:200});
}
