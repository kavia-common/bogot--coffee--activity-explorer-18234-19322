import { createClient } from '@supabase/supabase-js'

export const getURL = () => {
  let url = process.env.REACT_APP_SITE_URL || window.location.origin || 'http://localhost:3000'
  if (!url.startsWith('http')) url = `https://${url}`
  if (!url.endsWith('/')) url = `${url}/`
  return url
}

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars are missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in .env'
  )
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '')

// Auth helpers

export const signInWithMagicLink = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getURL()}auth/callback`,
    },
  })
  return { data, error }
}

export const signInWithOAuth = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getURL()}auth/callback`,
    },
  })
  return { data, error }
}

export const signUpWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getURL()}auth/callback`,
    },
  })
  return { data, error }
}

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getURL()}auth/reset-password`,
  })
  return { data, error }
}

export const handleAuthError = (error, navigate) => {
  // naive handler; navigate is from react-router
  // eslint-disable-next-line no-console
  console.error('Authentication error:', error)
  const message = String(error?.message || '')
  if (message.includes('redirect')) {
    navigate('/auth/error?type=redirect')
  } else if (message.includes('email')) {
    navigate('/auth/error?type=email')
  } else {
    navigate('/auth/error')
  }
}
