"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useData } from "@/lib/data-context"
import type { ViewType } from "@/app/page"

interface SidebarProps {
  currentView: ViewType
  onNavigate: (view: ViewType) => void
}

const navItems = [
  { id: "dashboard" as ViewType, label: "Dashboard", icon: HomeIcon },
  { id: "calendar" as ViewType, label: "Calendar", icon: CalendarIcon },
  { id: "clients" as ViewType, label: "Clients", icon: UsersIcon },
  { id: "sessions" as ViewType, label: "Sessions", icon: ClipboardIcon },
  { id: "database" as ViewType, label: "Database", icon: DatabaseIcon },
  { id: "settings" as ViewType, label: "Settings", icon: SettingsIcon },
]

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { clients, addSession, tests } = useData()
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false)
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const { addClient } = useData()

  const [newSession, setNewSession] = useState({
    clientId: "",
    date: "",
    time: "",
    duration: "45",
    type: "Speech Therapy",
    address: "",
    activities: [] as string[],
  })

  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    age: "",
    diagnosis: "",
    sessionsPerWeek: "2",
    guardian: "",
    phone: "",
    email: "",
    notes: "",
  })

  const handleAddSession = () => {
    const client = clients.find((c) => c.id === Number(newSession.clientId))
    if (client && newSession.date && newSession.time) {
      addSession({
        clientId: client.id,
        client: client.name,
        avatar: client.avatar,
        date: newSession.date,
        time: newSession.time,
        duration: `${newSession.duration} min`,
        type: newSession.type,
        address: newSession.address,
        status: "confirmed",
        notes: "",
        plannedActivities: newSession.activities.map((name, idx) => ({
          id: idx + 1,
          name,
          completed: false,
        })),
      })
      setNewSession({
        clientId: "",
        date: "",
        time: "",
        duration: "45",
        type: "Speech Therapy",
        address: "",
        activities: [],
      })
      setIsNewSessionOpen(false)
      onNavigate("calendar")
    }
  }

  const handleAddClient = () => {
    if (newClient.firstName && newClient.lastName) {
      addClient({
        name: `${newClient.firstName} ${newClient.lastName}`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newClient.firstName}${newClient.lastName}`,
        age: Number(newClient.age) || 0,
        diagnosis: newClient.diagnosis || "Not specified",
        sessionsPerWeek: Number(newClient.sessionsPerWeek) || 2,
        nextSession: "Not scheduled",
        progress: "New",
        notes: newClient.notes || "",
        guardian: newClient.guardian || "",
        phone: newClient.phone || "",
        email: newClient.email || "",
        status: "active",
      })
      setNewClient({
        firstName: "",
        lastName: "",
        age: "",
        diagnosis: "",
        sessionsPerWeek: "2",
        guardian: "",
        phone: "",
        email: "",
        notes: "",
      })
      setIsNewClientOpen(false)
      onNavigate("clients")
    }
  }

  const toggleActivity = (activityName: string) => {
    setNewSession((prev) => ({
      ...prev,
      activities: prev.activities.includes(activityName)
        ? prev.activities.filter((a) => a !== activityName)
        : [...prev.activities, activityName],
    }))
  }

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <svg
            className="h-5 w-5 text-accent-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>
        <span className="text-xl font-semibold text-sidebar-foreground">
          Clarity
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`group flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-colors ${
                      currentView === item.id
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </li>

          {/* Quick Actions */}
          <li>
            <div className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Quick Actions
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              <li>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-sidebar-border bg-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  onClick={() => setIsNewSessionOpen(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                  New Session
                </Button>
              </li>
              <li>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-sidebar-border bg-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  onClick={() => setIsNewClientOpen(true)}
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Add Client
                </Button>
              </li>
            </ul>
          </li>

          {/* User Profile */}
          <li className="-mx-2 mt-auto">
            <div className="flex items-center gap-x-4 rounded-lg p-2 hover:bg-sidebar-accent">
              <Avatar className="h-10 w-10 border-2 border-sidebar-border">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt="Dr. Sarah Chen"
                />
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
                  SC
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Dr. Sarah Chen
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  Speech Therapist
                </p>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      {/* New Session Dialog */}
      <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-client">Client</Label>
              <Select
                value={newSession.clientId}
                onValueChange={(value) =>
                  setNewSession({ ...newSession, clientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-date">Date</Label>
                <Input
                  type="date"
                  id="session-date"
                  value={newSession.date}
                  onChange={(e) =>
                    setNewSession({ ...newSession, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-time">Time</Label>
                <Input
                  type="time"
                  id="session-time"
                  value={newSession.time}
                  onChange={(e) =>
                    setNewSession({ ...newSession, time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-type">Session Type</Label>
              <Select
                value={newSession.type}
                onValueChange={(value) =>
                  setNewSession({ ...newSession, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
                  <SelectItem value="Language Development">
                    Language Development
                  </SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-address">Address</Label>
              <Input
                id="session-address"
                type="text"
                placeholder="Enter session address"
                value={newSession.address}
                onChange={(e) =>
                  setNewSession({ ...newSession, address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-duration">Duration</Label>
              <Select
                value={newSession.duration}
                onValueChange={(value) =>
                  setNewSession({ ...newSession, duration: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tests / Activities</Label>
              <div className="max-h-32 overflow-y-auto rounded-lg border border-border p-2 space-y-1">
                {tests.slice(0, 10).map((test) => (
                  <label
                    key={test.id}
                    className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={newSession.activities.includes(test.name)}
                      onChange={() => toggleActivity(test.name)}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-foreground">{test.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {newSession.activities.length} selected
              </p>
            </div>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleAddSession}
              disabled={!newSession.clientId || !newSession.date || !newSession.time || !newSession.address}
            >
              Schedule Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Client Dialog */}
      <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-firstName">First Name</Label>
                <Input
                  id="client-firstName"
                  placeholder="First name"
                  value={newClient.firstName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-lastName">Last Name</Label>
                <Input
                  id="client-lastName"
                  placeholder="Last name"
                  value={newClient.lastName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-age">Age</Label>
                <Input
                  id="client-age"
                  type="number"
                  placeholder="Age"
                  value={newClient.age}
                  onChange={(e) =>
                    setNewClient({ ...newClient, age: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-diagnosis">Diagnosis</Label>
                <Select
                  value={newClient.diagnosis}
                  onValueChange={(value) =>
                    setNewClient({ ...newClient, diagnosis: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Articulation Disorder">
                      Articulation Disorder
                    </SelectItem>
                    <SelectItem value="Language Delay">Language Delay</SelectItem>
                    <SelectItem value="Stuttering">Stuttering</SelectItem>
                    <SelectItem value="Apraxia of Speech">
                      Apraxia of Speech
                    </SelectItem>
                    <SelectItem value="Phonological Disorder">
                      Phonological Disorder
                    </SelectItem>
                    <SelectItem value="Voice Disorder">Voice Disorder</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-sessions">Sessions per Week</Label>
              <Select
                value={newClient.sessionsPerWeek}
                onValueChange={(value) =>
                  setNewClient({ ...newClient, sessionsPerWeek: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 session</SelectItem>
                  <SelectItem value="2">2 sessions</SelectItem>
                  <SelectItem value="3">3 sessions</SelectItem>
                  <SelectItem value="4">4 sessions</SelectItem>
                  <SelectItem value="5">5 sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-t border-border pt-4">
              <h4 className="mb-3 text-sm font-medium text-foreground">
                Guardian Information
              </h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-guardian">Guardian Name</Label>
                  <Input
                    id="client-guardian"
                    placeholder="Guardian name"
                    value={newClient.guardian}
                    onChange={(e) =>
                      setNewClient({ ...newClient, guardian: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input
                      id="client-phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={newClient.phone}
                      onChange={(e) =>
                        setNewClient({ ...newClient, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="email@example.com"
                      value={newClient.email}
                      onChange={(e) =>
                        setNewClient({ ...newClient, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleAddClient}
              disabled={!newClient.firstName || !newClient.lastName}
            >
              Add Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
      />
    </svg>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
      />
    </svg>
  )
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
      />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  )
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
      />
    </svg>
  )
}
