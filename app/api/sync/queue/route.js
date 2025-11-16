import { supabase } from '../../../../lib/supabaseClient'

export async function POST(req) {
  const body = await req.json()

  if (!body?.items) {
    return new Response('Bad request: missing items', { status: 400 })
  }

  const { data, error } = await supabase.from('usages').insert(body.items)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    })
  }

  return new Response(
    JSON.stringify({ inserted: data?.length || body.items.length }),
    { status: 200 }
  )
}
