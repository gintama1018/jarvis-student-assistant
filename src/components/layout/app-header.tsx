"use client"

import { useState } from "react"
import { Search, Bell, Menu, Sun, Moon, User, Settings, LogOut, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface AppHeaderProps {
  breadcrumbs?: Array<{ label: string; href?: string }>
  onMobileMenuToggle?: () => void
  onSearch?: (query: string) => void
  onThemeToggle?: () => void
  isDarkMode?: boolean
  notificationCount?: number
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onSignOut?: () => void
}

export default function AppHeader({
  breadcrumbs = [{ label: "Dashboard" }],
  onMobileMenuToggle,
  onSearch,
  onThemeToggle,
  isDarkMode = true,
  notificationCount = 0,
  user = { name: "John Doe", email: "john@example.com" },
  onProfileClick,
  onSettingsClick,
  onSignOut,
}: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  return (
    <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
      {/* Left Section - Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 hover:bg-accent"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle mobile menu</span>
        </Button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] mx-2" />
              )}
              <span 
                className={`${
                  index === breadcrumbs.length - 1 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground cursor-pointer"
                }`}
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes and tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-background border-input hover:border-ring focus:border-ring transition-colors"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-accent"
          onClick={onThemeToggle}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-accent relative"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center min-w-[1.25rem]"
            >
              {notificationCount > 99 ? "99+" : notificationCount}
            </Badge>
          )}
          <span className="sr-only">
            {notificationCount > 0 ? `${notificationCount} notifications` : "No notifications"}
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="p-1 hover:bg-accent rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
            <DropdownMenuLabel className="pb-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-popover-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onProfileClick}
              className="cursor-pointer hover:bg-accent"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onSettingsClick}
              className="cursor-pointer hover:bg-accent"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onSignOut}
              className="cursor-pointer hover:bg-accent text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}