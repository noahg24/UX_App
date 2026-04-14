"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useData, type Client, type Session } from "@/lib/data-context"
import type { ViewType } from "@/app/page"

interface ClientsViewProps {
  onNavigate: (view: ViewType) => void
}

export function ClientsView({ onNavigate }: ClientsViewProps) {
  const { clients, addClient, addSession, getSessionsForClient, tests } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showScheduleSession, setShowScheduleSession] = useState(false)

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

  const [newSession, setNewSession] = useState({
    date: "",
    time: "",
    duration: "45",
    type: "Speech Therapy",
    activities: [] as string[],
  })

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      setIsAddClientOpen(false)
    }
  }

  const handleScheduleSession = () => {
    if (selectedClient && newSession.date && newSession.time) {
      addSession({
        clientId: selectedClient.id,
        client: selectedClient.name,
        avatar: selectedClient.avatar,
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
        date: "",
        time: "",
        duration: "45",
        type: "Speech Therapy",
        activities: [],
      })
      setShowScheduleSession(false)
      onNavigate("calendar")
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

  const clientHistory = selectedClient ? getSessionsForClient(selectedClient.id) : []

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Clients</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {clients.length} clients in your care
          </p>
        </div>
        <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={newClient.firstName}
                    onChange={(e) =>
                      setNewClient({ ...newClient, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
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
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    value={newClient.age}
                    onChange={(e) =>
                      setNewClient({ ...newClient, age: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
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
                      <SelectItem value="Articulation Disorder">Articulation Disorder</SelectItem>
                      <SelectItem value="Language Delay">Language Delay</SelectItem>
                      <SelectItem value="Stuttering">Stuttering</SelectItem>
                      <SelectItem value="Apraxia of Speech">Apraxia of Speech</SelectItem>
                      <SelectItem value="Phonological Disorder">Phonological Disorder</SelectItem>
                      <SelectItem value="Voice Disorder">Voice Disorder</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessions">Sessions per Week</Label>
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
                <h4 className="mb-3 text-sm font-medium text-foreground">Guardian Information</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardian">Guardian Name</Label>
                    <Input
                      id="guardian"
                      placeholder="Guardian name"
                      value={newClient.guardian}
                      onChange={(e) =>
                        setNewClient({ ...newClient, guardian: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={newClient.phone}
                        onChange={(e) =>
                          setNewClient({ ...newClient, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
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
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the client..."
                  value={newClient.notes}
                  onChange={(e) =>
                    setNewClient({ ...newClient, notes: e.target.value })
                  }
                  rows={3}
                />
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

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="cursor-pointer border-border/50 transition-all hover:border-accent/50 hover:shadow-md"
            onClick={() => setSelectedClient(client)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0 border border-border sm:h-12 sm:w-12">
                  <AvatarImage src={client.avatar} alt={client.name} />
                  <AvatarFallback className="text-xs sm:text-sm">
                    {client.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <h3 className="font-medium text-foreground text-sm truncate">
                      {client.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        client.status === "active"
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {client.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Age {client.age} · {client.diagnosis}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Sessions: </span>
                  <span className="text-foreground">{client.sessionsPerWeek}/wk</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Progress: </span>
                  <span className="text-foreground">{client.progress}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs sm:mt-3 sm:px-3 sm:py-2">
                <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">Next:</span>
                <span className="text-foreground truncate">{client.nextSession}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Detail Dialog */}
      <Dialog open={!!selectedClient && !showHistory && !showScheduleSession} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border sm:h-12 sm:w-12">
                    <AvatarImage src={selectedClient.avatar} alt={selectedClient.name} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {selectedClient.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg">{selectedClient.name}</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          selectedClient.status === "active"
                            ? "bg-accent/10 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {selectedClient.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-normal text-muted-foreground sm:text-sm">
                      Age {selectedClient.age}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                {/* Clinical Info */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground sm:mb-3">Clinical Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diagnosis</span>
                      <span className="text-right text-foreground">{selectedClient.diagnosis}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sessions/Week</span>
                      <span className="text-foreground">{selectedClient.sessionsPerWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{selectedClient.progress}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Treatment Notes</h4>
                  <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground sm:text-sm">
                    {selectedClient.notes || "No notes recorded"}
                  </p>
                </div>

                {/* Guardian Info */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground sm:mb-3">Guardian Contact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-foreground">{selectedClient.guardian || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-foreground">{selectedClient.phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-foreground truncate">{selectedClient.email || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Button
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => setShowScheduleSession(true)}
                  >
                    Schedule Session
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowHistory(true)}
                  >
                    View History
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Session Dialog */}
      <Dialog open={showScheduleSession} onOpenChange={setShowScheduleSession}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Session for {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                  <SelectItem value="Language Development">Language Development</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowScheduleSession(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleScheduleSession}
                disabled={!newSession.date || !newSession.time}
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Session History - {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {clientHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No session history available
              </div>
            ) : (
              clientHistory.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-border/50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">{session.type}</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        session.status === "completed"
                          ? "bg-accent/10 text-accent"
                          : session.status === "confirmed"
                          ? "bg-chart-2/10 text-chart-2"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(session.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at {session.time} · {session.duration}
                  </p>
                  {session.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {session.notes}
                    </p>
                  )}
                  {session.plannedActivities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {session.plannedActivities.map((activity) => (
                        <span
                          key={activity.id}
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            activity.completed
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {activity.completed ? "Done" : "Pending"}: {activity.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowHistory(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  )
}
