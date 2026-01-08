import { Palette, Check, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { useEffect } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const { user } = useAuth()

  const isEliteOrAdmin = user?.tier === "elite" || user?.role === "admin"

  // Auto-revert to light theme if non-elite user has restricted theme active
  useEffect(() => {
    if (user && !isEliteOrAdmin && (theme === "retro" || theme === "cyberpunk")) {
      setTheme("light")
      toast.info("Premium themes are exclusive to Elite subscribers. Theme changed to Light.")
    }
  }, [user, isEliteOrAdmin, theme, setTheme])

  const themes = [
    {
      name: "light",
      label: "Light",
      colors: { bg: "#ffffff", primary: "oklch(0.758 0.123 265.7)" },
      locked: false
    },
    {
      name: "dark",
      label: "Dark",
      colors: { bg: "#1a1a1a", primary: "oklch(0.922 0 0)" },
      locked: false
    },
    {
      name: "retro",
      label: "Retro",
      colors: { bg: "#e0dcd3", primary: "#d97757" },
      locked: !isEliteOrAdmin
    },
    {
      name: "cyberpunk",
      label: "Cyberpunk",
      colors: { bg: "#0b0b15", primary: "#ff003c" },
      locked: !isEliteOrAdmin
    }
  ]

  const handleThemeChange = (themeName: string, isLocked: boolean) => {
    if (isLocked) {
      toast.error("This theme is exclusive to Elite subscribers and Admins! Upgrade to Elite to unlock.")
      return
    }
    setTheme(themeName)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Palette className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.name}
            onClick={() => handleThemeChange(t.name, t.locked)}
            className={cn(
              "flex items-center justify-between gap-2 cursor-pointer",
              t.locked && "opacity-60"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full border shadow-sm flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: t.colors.bg }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: t.colors.primary }}
                />
              </div>
              <span>{t.label}</span>
              {t.locked && <Lock className="h-3 w-3 text-yellow-600" />}
            </div>
            {theme === t.name && !t.locked && <Check className="h-3 w-3" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
          <span className="ml-6">System</span>
          {theme === "system" && <Check className="h-3 w-3 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}