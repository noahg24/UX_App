"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type Session } from "@/lib/data-context"

interface SessionsViewProps {
  onMessageClient: (clientId: number) => void
}

export function SessionsView({ onMessageClient }: SessionsViewProps) {
  const { getUpcomingSessions, getPastSessions, updateSession, tests, addSession, clients } = useData()
  const upcomingSessions = getUpcomingSessions()
  const pastSessions = getPastSessions()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [sessionNotes, setSessionNotes] = useState("")
  const [activities, setActivities] = useState<Session["plannedActivities"]>([])
  const [newActivity, setNewActivity] = useState("")
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false)
  const [newSession, setNewSession] = useState({
    clientId: "",
    date: "",
    time: "",
    duration: "45",
    type: "Speech Therapy",
    address: "",
    activities: [] as string[],
  })

  const filterSessions = (sessionList: Session[]) => {
    return sessionList.filter((session) =>
      session.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

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

  const addActivity = () => {
    if (newActivity.trim()) {
      setActivities(prev => [
        ...prev,
        { id: Date.now(), name: newActivity.trim(), completed: false }
      ])
      setNewActivity("")
    }
  }

  const handleCompleteSession = (sessionId: number) => {
    updateSession(sessionId, { status: "completed" })
  }

  const handleStatusChange = (status: Session["status"]) => {
    if (!selectedSession) return
    setSelectedSession((prev) => (prev ? { ...prev, status } : prev))
    updateSession(selectedSession.id, { status })
  }

  const handleSaveSession = () => {
    if (selectedSession) {
      updateSession(selectedSession.id, { notes: sessionNotes })
      setSelectedSession(null)
    }
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
      setIsAddSessionOpen(false)
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

  const formatDateLabel = (dateStr: string) => {
    const today = "2026-04-14"
    const yesterday = "2026-04-13"
    const tomorrow = "2026-04-15"
    if (dateStr === today) return "Today"
    if (dateStr === yesterday) return "Yesterday"
    if (dateStr === tomorrow) return "Tomorrow"
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Sessions</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your therapy sessions and notes
          </p>
        </div>
        <Button
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => setIsAddSessionOpen(true)}
        >
          <PlusIcon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Session</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="gap-1 text-xs sm:gap-2 sm:text-sm">
            <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Upcoming
            <Badge variant="secondary" className="ml-1 bg-accent/10 text-accent text-xs px-1.5">
              {upcomingSessions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-1 text-xs sm:gap-2 sm:text-sm">
            <CheckCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {filterSessions(upcomingSessions).length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" />
                <h3 className="mt-4 text-base font-medium text-foreground sm:text-lg">No upcoming sessions</h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Schedule a new session to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            filterSessions(upcomingSessions).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => handleSessionClick(session)}
                formatDate={formatDateLabel}
                showActions
                onCompleteSession={handleCompleteSession}
                onMessageClient={onMessageClient}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {filterSessions(pastSessions).length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <CheckCircleIcon className="h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" />
                <h3 className="mt-4 text-base font-medium text-foreground sm:text-lg">No completed sessions</h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Completed sessions will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            filterSessions(pastSessions).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => handleSessionClick(session)}
                formatDate={formatDateLabel}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle>Session Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                {/* Client Info */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="h-10 w-10 border border-border sm:h-12 sm:w-12">
                    <AvatarImage src={selectedSession.avatar} alt={selectedSession.client} />
                    <AvatarFallback>
                      {selectedSession.client.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground text-sm sm:text-base">{selectedSession.client}</h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">{selectedSession.type}</p>
                  </div>
                </div>

                {/* Session Info */}
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 sm:gap-4 sm:p-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Date</span>
                    <p className="text-sm font-medium text-foreground">{formatDateLabel(selectedSession.date)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Time</span>
                    <p className="text-sm font-medium text-foreground">{selectedSession.time}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Duration</span>
                    <p className="text-sm font-medium text-foreground">{selectedSession.duration}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="session-status">Status</Label>
                    <Select
                      value={selectedSession.status}
                      onValueChange={(value) => handleStatusChange(value as Session["status"])}
                    >
                      <SelectTrigger id="session-status" className="mt-1 w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground">Address</span>
                    <p className="text-sm font-medium text-foreground">
                      {selectedSession.address}
                    </p>
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
                        className="flex items-center gap-3 rounded-lg border border-border/50 p-2.5 sm:p-3"
                      >
                        <Checkbox
                          id={`session-activity-${activity.id}`}
                          checked={activity.completed}
                          onCheckedChange={() => toggleActivity(activity.id)}
                        />
                        <label
                          htmlFor={`session-activity-${activity.id}`}
                          className={`flex-1 text-xs cursor-pointer sm:text-sm ${
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
                  
                  {/* Add new activity */}
                  {selectedSession.status !== "completed" && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        placeholder="Add activity or test..."
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addActivity()}
                        className="text-sm"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={addActivity}
                        disabled={!newActivity.trim()}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="session-notes" className="mb-2 block text-sm font-medium text-foreground">
                    Session Notes
                  </Label>
                  <Textarea
                    id="session-notes"
                    placeholder="Add notes about this session..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    rows={4}
                    className="resize-none text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Button 
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handleSaveSession}
                  >
                    Save Notes
                  </Button>
                  {selectedSession.status !== "completed" && (
                    <Button variant="outline" className="flex-1">
                      Reschedule
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Session Dialog */}
      <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
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
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  id="date"
                  value={newSession.date}
                  onChange={(e) =>
                    setNewSession({ ...newSession, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  type="time"
                  id="time"
                  value={newSession.time}
                  onChange={(e) =>
                    setNewSession({ ...newSession, time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Session Type</Label>
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter session address"
                value={newSession.address}
                onChange={(e) =>
                  setNewSession({ ...newSession, address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
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
                {tests.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-2 py-3">
                    No saved tests or activities yet. Add items in Manage Activities.
                  </p>
                ) : (
                  tests.map((test) => (
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
                  ))
                )}
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
    </div>
  )
}

function SessionCard({
  session,
  onClick,
  formatDate,
  showActions = false,
  onCompleteSession,
  onMessageClient,
}: {
  session: Session
  onClick: () => void
  formatDate: (date: string) => string
  showActions?: boolean
  onCompleteSession?: (sessionId: number) => void
  onMessageClient?: (clientId: number) => void
}) {
  return (
    <Card
      className="cursor-pointer border-border/50 transition-all hover:border-accent/50 hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0 border border-border sm:h-10 sm:w-10">
            <AvatarImage src={session.avatar} alt={session.client} />
            <AvatarFallback className="text-xs">
              {session.client.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <h3 className="font-medium text-foreground text-sm">{session.client}</h3>
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
            <p className="text-xs text-muted-foreground">{session.type}</p>
            {session.notes && (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                {session.notes}
              </p>
            )}
            {session.plannedActivities.length > 0 && !session.notes && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {session.plannedActivities.length} activities planned
              </p>
            )}
            {/* Mobile date/time display */}
            <div className="mt-1.5 text-xs text-muted-foreground sm:hidden">
              {formatDate(session.date)} · {session.time} · {session.duration}
            </div>
          </div>
          {/* Desktop date/time display */}
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-sm font-medium text-foreground">{formatDate(session.date)}</p>
            <p className="text-xs text-muted-foreground">{session.time}</p>
            <p className="text-xs text-muted-foreground">{session.duration}</p>
          </div>
        </div>
        {showActions && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <VideoIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
              Video
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation()
                onMessageClient?.(session.clientId)
              }}
            >
              Message
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation()
                onCompleteSession?.(session.id)
              }}
            >
              <CheckIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
              Complete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
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

function ClipboardListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  )
}
