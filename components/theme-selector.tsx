"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Check, Moon, Sun, Laptop, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  {
    name: "Light",
    id: "light",
    icon: Sun,
  },
  {
    name: "Dark",
    id: "dark",
    icon: Moon,
  },
  {
    name: "System",
    id: "system",
    icon: Laptop,
  },
  {
    name: "Purple",
    id: "purple",
    icon: Palette,
    color: "#8B5CF6",
  },
  {
    name: "Ocean",
    id: "ocean",
    icon: Palette,
    color: "#0EA5E9",
  },
  {
    name: "Forest",
    id: "forest",
    icon: Palette,
    color: "#22C55E",
  },
  {
    name: "Sunset",
    id: "sunset",
    icon: Palette,
    color: "#F59E0B",
  },
  {
    name: "Rose",
    id: "rose",
    icon: Palette,
    color: "#EC4899",
  },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full">
        <Palette className="h-5 w-5" />
        <span className="sr-only">Theme selector</span>
      </Button>
    )
  }

  // Find current theme object
  const currentTheme = themes.find((t) => t.id === theme) || themes[0]
  const Icon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          {currentTheme.id === "light" ? (
            <Sun className="h-5 w-5" />
          ) : currentTheme.id === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : currentTheme.id === "system" ? (
            <Laptop className="h-5 w-5" />
          ) : (
            <Palette className="h-5 w-5" style={{ color: currentTheme.color }} />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => {
          const ThemeIcon = t.icon
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="flex items-center gap-2"
            >
              {t.id === "light" ? (
                <Sun className="h-4 w-4" />
              ) : t.id === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : t.id === "system" ? (
                <Laptop className="h-4 w-4" />
              ) : (
                <Palette className="h-4 w-4" style={{ color: t.color }} />
              )}
              <span>{t.name}</span>
              {theme === t.id && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 