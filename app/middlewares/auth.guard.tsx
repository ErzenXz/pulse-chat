"use client"

import { useEffect } from 'react'
import { useAuth } from '@/context/auth-context'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  useEffect(() => {
    const redirectToAuth = () => {
      const currentUrl = encodeURIComponent(window.location.href)
      window.location.replace(`https://auth.erzen.tk?return_to=${currentUrl}`)
    }

    if (!loading && !user) {
      redirectToAuth()
    }
  }, [user, loading])

  if (loading || !user) {
    return null
  }

  return <>{children}</>
}