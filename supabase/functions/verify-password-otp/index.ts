import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.25.76'

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  otp: z.string().regex(/^\d{6}$/, 'OTP must contain six digits.'),
})

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('')

const hashOtp = async (otp: string, salt: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${otp}`))
  return bytesToHex(new Uint8Array(digest))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: 'Service unavailable' }, 500)

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return jsonResponse({ error: 'Enter the six-digit OTP from your email.' }, 400)

  const email = parsed.data.email.toLowerCase()
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: resetCode, error: lookupError } = await admin
    .from('password_reset_otps')
    .select('id, otp_hash, otp_salt, expires_at, attempts, used_at')
    .eq('email', email)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lookupError || !resetCode) return jsonResponse({ error: 'That OTP is invalid or has expired.' }, 400)
  if (resetCode.attempts >= 5) return jsonResponse({ error: 'Too many attempts. Request a new OTP.' }, 429)
  if (new Date(resetCode.expires_at).getTime() <= Date.now()) return jsonResponse({ error: 'That OTP has expired. Request a new one.' }, 400)

  const expectedHash = await hashOtp(parsed.data.otp, resetCode.otp_salt)
  if (expectedHash !== resetCode.otp_hash) {
    await admin.from('password_reset_otps').update({ attempts: resetCode.attempts + 1 }).eq('id', resetCode.id)
    return jsonResponse({ error: 'That OTP is incorrect.' }, 400)
  }

  return jsonResponse({ message: 'OTP verified.' })
})