"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="pulse-theme"
      themes={["light", "dark", "purple", "ocean", "forest", "sunset", "rose"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

