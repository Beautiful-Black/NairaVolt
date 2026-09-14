import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.25.76'

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
})

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('')

const hashOtp = async (otp: string, salt: string) => {
  const data = new TextEncoder().encode(`${salt}:${otp}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(digest))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: 'Service unavailable' }, 500)

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return jsonResponse({ error: 'Enter a valid email address.' }, 400)

  const email = parsed.data.email.toLowerCase()
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: userResult, error: userError } = await admin.auth.admin.getUserByEmail(email)
  if (userError || !userResult.user) return jsonResponse({ error: 'No NairaVolt account was found for this email.' }, 404)

  const digits = new Uint32Array(1)
  crypto.getRandomValues(digits)
  const otp = String(digits[0] % 1_000_000).padStart(6, '0')
  const saltBytes = new Uint8Array(16)
  crypto.getRandomValues(saltBytes)
  const salt = bytesToHex(saltBytes)
  const otpHash = await hashOtp(otp, salt)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error: insertError } = await admin.from('password_reset_otps').insert({
    email,
    user_id: userResult.user.id,
    otp_hash: otpHash,
    otp_salt: salt,
    expires_at: expiresAt,
  })
  if (insertError) return jsonResponse({ error: 'We could not create a reset code. Try again.' }, 500)

  const { error: emailError } = await admin.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'password-reset-otp',
      recipientEmail: email,
      idempotencyKey: `password-reset-otp-${userResult.user.id}-${otpHash.slice(0, 16)}`,
      templateData: { otp, expiresInMinutes: 10 },
    },
  })

  if (emailError) {
    await admin.from('password_reset_otps').delete().eq('otp_hash', otpHash)
    console.error('Password OTP email failed:', emailError.message)
    return jsonResponse({ error: 'We could not send the OTP email. Please try again.' }, 502)
  }

  return jsonResponse({ message: 'OTP sent.' })
})