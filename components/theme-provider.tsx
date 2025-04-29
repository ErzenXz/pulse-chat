"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: Readonly<ThemeProviderProps>) {
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

// Re-export the useTheme hook from next-themes
export { useTheme }

