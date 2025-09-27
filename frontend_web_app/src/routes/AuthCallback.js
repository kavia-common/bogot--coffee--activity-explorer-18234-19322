import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handle = async () => {
      // For supabase-js v2, getSessionFromUrl was replaced by exchangeCodeForSession
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Auth callback error:', error)
        navigate('/auth/error')
        return
      }
      if (data?.session) {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    }
    handle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div style={{ padding: 16 }}>Procesando autenticación...</div>
}
