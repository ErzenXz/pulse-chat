"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = !!user

  useEffect(() => {
    // Skip redirection during loading to prevent flashes
    if (isLoading) return

    // For pages that require authentication
    if (requireAuth && !isAuthenticated) {
      // Encode the current URL to be used as the return_to parameter
      const returnTo = encodeURIComponent(window.location.href)
      window.location.href = `https://auth.erzen.tk?return_to=${returnTo}`
      return
    }

    // For home page redirect when authenticated
    if (pathname === "/" && isAuthenticated) {
      router.push("/conversations")
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname])

  // Show children only if:
  // - User is authenticated on pages that require auth
  // - User is on a page that doesn't require auth (like the homepage)
  if ((requireAuth && isAuthenticated) || (!requireAuth)) {
    return <>{children}</>
  }

  // Return null for protected routes when not authenticated (redirect is happening)
  // or when still loading to prevent flash of content
  return null
}