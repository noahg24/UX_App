"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useData, type Session } from "@/lib/data-context"
import type { ViewType } from "@/app/page"

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { getTodaysSessions, getPastSessions, clients, addSession, tests } = useData()
  const todaySessions = getTodaysSessions()
  const pastSessions = getPastSessions()
  
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [sessionNotes, setSessionNotes] = useState("")
  const [activities, setActivities] = useState<Session["plannedActivities"]>([])
  
  // Quick action dialogs
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false)
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  
  const [newSession, setNewSession] = useState({
    clientId: "",
    date: "",
    time: "",
    duration: "45",
    type: "Speech Therapy",
    activities: [] as string[],
  })

  const { addClient } = useData()
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    age: "",
    diagnosis: "",
    sessionsPerWeek: "2",
    guardian: "",
    phone: "",
    email: "",
  })

  const stats = [
    { label: "Today", value: String(todaySessions.length), sublabel: "sessions" },
    { label: "Clients", value: String(clients.filter(c => c.status === "active").length), sublabel: "active" },
    { label: "Hours", value: "32", sublabel: "this week" },
    { label: "Rate", value: "94%", sublabel: "completion" },
  ]

  const recentNotes = pastSessions.slice(0, 3).map(s => ({
    id: s.id,
    client: s.client,
    date: formatDateLabel(s.date),
    preview: s.notes,
  }))

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session)
    setSessionNotes(session.notes)
    setActivities(session.plannedActivities.map(a => ({ ...a })))
  }

  const toggleActivity = (activityId: number) => {
    setActivities(prev => 
      prev.map(a => a.id === activityId ? { ...a, completed: !a.completed } : a)
    )
  }

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
        notes: "",
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
      })
      setIsNewClientOpen(false)
      onNavigate("clients")
    }
  }

  const toggleSessionActivity = (activityName: string) => {
    setNewSession((prev) => ({
      ...prev,
      activities: prev.activities.includes(activityName)
        ? prev.activities.filter((a) => a !== activityName)
        : [...prev.activities, activityName],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Good morning, Sarah
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You have {todaySessions.length} sessions scheduled for today
        </p>
      </div>

      {/* Stats Grid - Mobile optimized */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-semibold text-foreground sm:text-2xl">
                  {stat.value}
                </span>
                <span className="text-xs text-accent">{stat.sublabel}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Sessions */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold sm:text-lg">
              {"Today's Schedule"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-accent hover:text-accent/80"
              onClick={() => onNavigate("calendar")}
            >
              View all
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No sessions scheduled for today
              </div>
            ) : (
              todaySessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border/50 p-3 text-left transition-colors hover:border-accent/50 hover:bg-muted/50 sm:items-center sm:gap-4"
                >
                  <Avatar className="h-10 w-10 shrink-0 border border-border">
                    <AvatarImage src={session.avatar} alt={session.client} />
                    <AvatarFallback>
                      {session.client.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="font-medium text-foreground text-sm sm:text-base">
                        {session.client}
                      </span>
                      <Badge
                        variant={session.status === "confirmed" ? "default" : "secondary"}
                        className={`text-xs ${
                          session.status === "confirmed"
                            ? "bg-accent/10 text-accent hover:bg-accent/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-2 sm:text-sm">
                      <span>{session.type}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="truncate">{session.duration}</span>
                    </div>
                    {/* Mobile time display */}
                    <div className="mt-1 text-xs text-foreground sm:hidden">
                      {session.time}
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <div className="font-medium text-foreground">{session.time}</div>
                    <div className="text-sm text-muted-foreground">{session.duration}</div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Notes */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold sm:text-lg">Recent Notes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-accent hover:text-accent/80"
              onClick={() => onNavigate("sessions")}
            >
              View all
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent notes
              </div>
            ) : (
              recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">{note.client}</span>
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 sm:text-sm">
                    {note.preview || "No notes recorded"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile optimized */}
      <Card className="border-border/50 bg-primary text-primary-foreground">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold sm:text-lg">Quick Actions</h3>
              <p className="text-xs text-primary-foreground/70 sm:text-sm">
                Common tasks at your fingertips
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 flex-col h-auto py-3 sm:flex-row sm:h-9 sm:py-1"
                onClick={() => setIsNewSessionOpen(true)}
              >
                <PlusIcon className="h-4 w-4 sm:mr-2" />
                <span className="text-xs mt-1 sm:mt-0 sm:text-sm">Session</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 flex-col h-auto py-3 sm:flex-row sm:h-9 sm:py-1"
                onClick={() => setIsNewClientOpen(true)}
              >
                <UserPlusIcon className="h-4 w-4 sm:mr-2" />
                <span className="text-xs mt-1 sm:mt-0 sm:text-sm">Client</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 flex-col h-auto py-3 sm:flex-row sm:h-9 sm:py-1"
                onClick={() => onNavigate("sessions")}
              >
                <DocumentIcon className="h-4 w-4 sm:mr-2" />
                <span className="text-xs mt-1 sm:mt-0 sm:text-sm">Notes</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle>Session Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Client Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={selectedSession.avatar} alt={selectedSession.client} />
                    <AvatarFallback>
                      {selectedSession.client.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">{selectedSession.client}</h3>
                    <p className="text-sm text-muted-foreground">{selectedSession.type}</p>
                  </div>
                </div>

                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Time</span>
                    <p className="text-sm font-medium text-foreground">{selectedSession.time}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Duration</span>
                    <p className="text-sm font-medium text-foreground">{selectedSession.duration}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge
                      variant="secondary"
                      className={
                        selectedSession.status === "confirmed"
                          ? "bg-accent/10 text-accent mt-1"
                          : "bg-muted text-muted-foreground mt-1"
                      }
                    >
                      {selectedSession.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Date</span>
                    <p className="text-sm font-medium text-foreground">{formatDateLabel(selectedSession.date)}</p>
                  </div>
                </div>

                {/* Planned Activities/Tests */}
                <div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <ClipboardListIcon className="h-4 w-4 text-accent" />
                    Planned Activities / Tests
                  </label>
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                      >
                        <Checkbox
                          id={`activity-${activity.id}`}
                          checked={activity.completed}
                          onCheckedChange={() => toggleActivity(activity.id)}
                        />
                        <label
                          htmlFor={`activity-${activity.id}`}
                          className={`flex-1 text-sm cursor-pointer ${
                            activity.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {activity.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Session Notes
                  </label>
                  <Textarea
                    placeholder="Add notes about this session..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Button 
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => setSelectedSession(null)}
                  >
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Start Session
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Reschedule
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Session Dialog */}
      <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quick-session-client">Client</Label>
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
                <Label htmlFor="quick-session-date">Date</Label>
                <Input
                  type="date"
                  id="quick-session-date"
                  value={newSession.date}
                  onChange={(e) =>
                    setNewSession({ ...newSession, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-session-time">Time</Label>
                <Input
                  type="time"
                  id="quick-session-time"
                  value={newSession.time}
                  onChange={(e) =>
                    setNewSession({ ...newSession, time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-session-type">Session Type</Label>
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
              <Label htmlFor="quick-session-duration">Duration</Label>
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
                      onChange={() => toggleSessionActivity(test.name)}
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
              disabled={!newSession.clientId || !newSession.date || !newSession.time}
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
                <Label htmlFor="quick-client-firstName">First Name</Label>
                <Input
                  id="quick-client-firstName"
                  placeholder="First name"
                  value={newClient.firstName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-client-lastName">Last Name</Label>
                <Input
                  id="quick-client-lastName"
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
                <Label htmlFor="quick-client-age">Age</Label>
                <Input
                  id="quick-client-age"
                  type="number"
                  placeholder="Age"
                  value={newClient.age}
                  onChange={(e) =>
                    setNewClient({ ...newClient, age: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-client-diagnosis">Diagnosis</Label>
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

function formatDateLabel(dateStr: string) {
  const today = "2026-04-14"
  const yesterday = "2026-04-13"
  if (dateStr === today) return "Today"
  if (dateStr === yesterday) return "Yesterday"
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function ClipboardListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}
