"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Toggle theme (loading)">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  // Determine the actual active theme via resolvedTheme to handle "system"
  const isDark = resolvedTheme === "dark"

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="w-9 h-9 hover:bg-primary/10 transition-colors"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      title="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4 text-foreground" /> : <Moon className="h-4 w-4 text-foreground" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
