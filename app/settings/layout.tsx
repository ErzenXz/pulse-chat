"use client"

import React from "react"
import AuthGuard from "@/app/middlewares/auth.guard"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  )
} 