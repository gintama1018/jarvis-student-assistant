"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Home, FileText, MessageCircle, User, Menu, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"

interface AppSidebarProps {
  onNavigate?: (section: string) => void
  activeSection?: string
  className?: string
}

const navigationItems = [
  {
    id: "tasks",
    label: "Tasks",
    icon: Home,
    href: "/tasks"
  },
  {
    id: "notes", 
    label: "Notes",
    icon: FileText,
    href: "/notes"
  },
  {
    id: "chat",
    label: "Chat", 
    icon: MessageCircle,
    href: "/chat"
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    href: "/profile"
  }
]

function SidebarContent({ 
  onNavigate, 
  activeSection, 
  onMobileClose,
  className 
}: { 
  onNavigate?: (section: string) => void
  activeSection?: string
  onMobileClose?: () => void
  className?: string
}) {
  const { theme, setTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className={cn("flex h-full flex-col bg-surface", className)}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between border-b border-border p-6">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="font-[var(--font-display)] font-semibold text-lg text-text-primary">
              Student Assistant
            </div>
          )}
        </div>
        
        {/* Collapse toggle - hidden on mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="hidden lg:flex h-8 w-8 p-0 text-text-secondary hover:text-text-primary hover:bg-accent"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sm font-medium transition-colors",
                  isCollapsed && "px-2 justify-center",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-text-secondary hover:text-text-primary hover:bg-accent",
                  "h-10"
                )}
                onClick={() => {
                  onNavigate?.(item.id)
                  onMobileClose?.()
                }}
              >
                <Icon className={cn("h-4 w-4", isCollapsed ? "mx-0" : "mr-0")} />
                {!isCollapsed && item.label}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-accent h-10",
            isCollapsed && "px-2 justify-center"
          )}
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {!isCollapsed && (theme === "dark" ? "Light Mode" : "Dark Mode")}
        </Button>
      </div>
    </div>
  )
}

export default function AppSidebar({ onNavigate, activeSection, className }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-surface border-border text-text-primary hover:bg-accent"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-64 p-0 bg-surface border-border"
          >
            <SidebarContent 
              onNavigate={onNavigate}
              activeSection={activeSection}
              onMobileClose={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:flex w-64 border-r border-border bg-surface", className)}>
        <SidebarContent 
          onNavigate={onNavigate}
          activeSection={activeSection}
        />
      </aside>
    </>
  )
}