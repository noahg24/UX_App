"use client"

import { useState } from "react"
import { MobileNav } from "@/components/scheduling/mobile-nav"
import { Sidebar } from "@/components/scheduling/sidebar"
import { DashboardView } from "@/components/scheduling/dashboard-view"
import { CalendarView } from "@/components/scheduling/calendar-view"
import { ClientsView } from "@/components/scheduling/clients-view"
import { SessionsView } from "@/components/scheduling/sessions-view"
import { SettingsView } from "@/components/scheduling/settings-view"
import { DatabaseView } from "@/components/scheduling/database-view"
import { MessagesView } from "@/components/scheduling/messages-view"
import { LoginView } from "@/components/scheduling/login-view"
import { DataProvider } from "@/lib/data-context"
import { useData } from "@/lib/data-context"

export type ViewType = "dashboard" | "calendar" | "clients" | "sessions" | "messages" | "settings" | "database"

function SchedulingAppContent() {
  const { isLoggedIn } = useData()
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isLoggedIn) {
    return <LoginView />
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={setCurrentView} />
      case "calendar":
        return <CalendarView />
      case "clients":
        return <ClientsView onNavigate={setCurrentView} />
      case "sessions":
        return <SessionsView />
      case "messages":
        return <MessagesView />
      case "settings":
        return <SettingsView />
      case "database":
        return <DatabaseView />
      default:
        return <DashboardView onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        currentView={currentView}
        onNavigate={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
          {renderView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
        <nav className="flex items-center justify-around py-2">
          {[
            { id: "dashboard" as ViewType, label: "Home", icon: HomeIcon },
            { id: "calendar" as ViewType, label: "Calendar", icon: CalendarIcon },
            { id: "clients" as ViewType, label: "Clients", icon: UsersIcon },
            { id: "messages" as ViewType, label: "Messages", icon: ChatIcon },
            { id: "sessions" as ViewType, label: "Sessions", icon: ClipboardIcon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                currentView === item.id
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default function SchedulingApp() {
  return (
    <DataProvider>
      <SchedulingAppContent />
    </DataProvider>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 4.5h5.25M12 19.5c4.142 0 7.5-2.916 7.5-6.5S16.142 6.5 12 6.5 4.5 9.416 4.5 13c0 1.225.39 2.35 1.055 3.264L4.5 18.75l3.461-1.231A7.474 7.474 0 0 0 12 19.5Z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  )
}
