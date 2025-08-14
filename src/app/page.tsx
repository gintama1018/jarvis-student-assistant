"use client"

import { useState } from "react"
import { ThemeProvider } from "next-themes"
import AppSidebar from "@/components/layout/app-sidebar"
import AppHeader from "@/components/layout/app-header"
import TaskManager from "@/components/features/task-manager"
import NotesManager from "@/components/features/notes-manager"
import AiChat from "@/components/features/ai-chat"
import UserProfile from "@/components/features/user-profile"

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("tasks")
  const [searchQuery, setSearchQuery] = useState("")

  const handleNavigate = (section: string) => {
    setActiveSection(section)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "tasks":
        return <TaskManager />
      case "notes":
        return <NotesManager />
      case "chat":
        return <AiChat />
      case "profile":
        return <UserProfile />
      default:
        return <TaskManager />
    }
  }

  const getSectionBreadcrumbs = () => {
    const breadcrumbMap = {
      tasks: [{ label: "Tasks" }],
      notes: [{ label: "Notes" }],
      chat: [{ label: "AI Chat" }],
      profile: [{ label: "Profile" }]
    }
    return breadcrumbMap[activeSection as keyof typeof breadcrumbMap] || [{ label: "Dashboard" }]
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex h-screen bg-background overflow-hidden">
        <AppSidebar 
          onNavigate={handleNavigate}
          activeSection={activeSection}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader 
            breadcrumbs={getSectionBreadcrumbs()}
            onSearch={handleSearch}
            notificationCount={3}
            user={{
              name: "Alex Chen",
              email: "alex.chen@example.com",
              avatar: ""
            }}
          />
          
          <main className="flex-1 overflow-hidden">
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}