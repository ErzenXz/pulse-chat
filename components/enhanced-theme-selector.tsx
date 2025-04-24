"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Check, Moon, Sun, Laptop, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

const themes = [
  {
    name: "Light",
    id: "light",
    icon: Sun,
    bg: "#ffffff",
    primary: "#0284c7",
    text: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0"
  },
  {
    name: "Dark",
    id: "dark",
    icon: Moon,
    bg: "#0f172a",
    primary: "#0ea5e9",
    text: "#f8fafc",
    muted: "#94a3b8",
    border: "#1e293b"
  },
  {
    name: "System",
    id: "system",
    icon: Laptop,
    bg: "linear-gradient(to right, #ffffff 50%, #0f172a 50%)",
    primary: "linear-gradient(to right, #0284c7 50%, #0ea5e9 50%)",
    text: "linear-gradient(to right, #0f172a 50%, #f8fafc 50%)",
    muted: "linear-gradient(to right, #64748b 50%, #94a3b8 50%)",
    border: "linear-gradient(to right, #e2e8f0 50%, #1e293b 50%)"
  },
  {
    name: "Purple",
    id: "purple",
    icon: Palette,
    bg: "#0f172a",
    primary: "#8b5cf6",
    text: "#f8fafc",
    muted: "#94a3b8",
    border: "#1e293b"
  },
  {
    name: "Ocean",
    id: "ocean",
    icon: Palette,
    bg: "#0f172a",
    primary: "#0ea5e9",
    text: "#f8fafc",
    muted: "#94a3b8",
    border: "#1e293b"
  },
  {
    name: "Forest",
    id: "forest",
    icon: Palette,
    bg: "#0f172a",
    primary: "#22c55e",
    text: "#f8fafc",
    muted: "#94a3b8",
    border: "#1e293b"
  },
  {
    name: "Sunset",
    id: "sunset",
    icon: Palette,
    bg: "#0f172a",
    primary: "#f59e0b",
    text: "#f8fafc",
    muted: "#94a3b8",
    border: "#1e293b"
  },
  {
    name: "Rose",
    id: "rose",
    icon: Palette,
    bg: "#0f172a",
    primary: "#ec4899",
    text: "#f8fafc",
    muted: "#94a3b8",
    border: "#1e293b"
  },
]

export function EnhancedThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-48 w-full bg-muted/20 animate-pulse rounded-lg" />
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {themes.map((t) => {
          const isActive = theme === t.id;
          const Icon = t.icon;
          
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "group relative flex flex-col items-center p-3 rounded-lg border transition-all duration-200",
                isActive 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Theme preview */}
              <div 
                className="w-full h-24 rounded-md mb-3 overflow-hidden"
                style={{ background: t.bg }}
              >
                {/* UI preview elements */}
                <div className="p-2 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="h-2 w-8 rounded-full" style={{ background: t.text }}></div>
                    <div className="h-3 w-3 rounded-full" style={{ background: t.primary }}></div>
                  </div>
                  
                  {/* Content */}
                  <div 
                    className="flex-1 rounded-sm mb-1"
                    style={{ background: t.border }}
                  ></div>
                  
                  {/* Button */}
                  <div 
                    className="self-end h-3 w-10 rounded-full"
                    style={{ background: t.primary }}
                  ></div>
                </div>
              </div>
              
              {/* Theme name */}
              <div className="flex items-center gap-1.5">
                <Icon 
                  className="h-3.5 w-3.5" 
                  style={{ color: t.id !== "light" && t.id !== "dark" && t.id !== "system" ? t.primary : undefined }}
                />
                <span className="text-sm font-medium">{t.name}</span>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
} 