// di dalam app/api/admin/usages/route.js
import { supabase } from '../../../../lib/supabaseClient'


export async function GET(req) {
  const adminPwd = req.headers.get('x-admin-password') || ''

  if (adminPwd !== process.env.ADMIN_PASSWORD) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data, error } = await supabase
    .from('usages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify(error), { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}
