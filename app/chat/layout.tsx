"use client";

import React from "react"
import AuthGuard from "@/app/middlewares/auth.guard"

export default function ChatLayout({
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