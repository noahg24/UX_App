"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useData, type Session } from "@/lib/data-context"

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const weekDaysShort = ["S", "M", "T", "W", "T", "F", "S"]

export function CalendarView() {
  const { sessions, clients, addSession, tests, getSessionsForDate } = useData()
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 14)) // April 14, 2026
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [selectedDay, setSelectedDay] = useState<Date>(new Date(2026, 3, 14))
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false)
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [sessionNotes, setSessionNotes] = useState("")
  const [activities, setActivities] = useState<Session["plannedActivities"]>([])

  const [newSession, setNewSession] = useState({
    clientId: "",
    date: "",
    time: "",
    duration: "45",
    type: "Speech Therapy",
    address: "",
    activities: [] as string[],
  })

  const getMonthData = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    const prevMonthDays = Array.from({ length: startDayOfWeek }, (_, i) => ({
      date: prevMonthLastDay - startDayOfWeek + i + 1,
      isCurrentMonth: false,
      fullDate: new Date(year, month - 1, prevMonthLastDay - startDayOfWeek + i + 1)
    }))
    
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      date: i + 1,
      isCurrentMonth: true,
      fullDate: new Date(year, month, i + 1)
    }))
    
    const totalDays = prevMonthDays.length + currentMonthDays.length
    const remainingDays = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7)
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
      date: i + 1,
      isCurrentMonth: false,
      fullDate: new Date(year, month + 1, i + 1)
    }))
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
  }

  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }

  const weekDates = getWeekDates()

  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getSessionsForDateObj = (date: Date) => {
    const dateStr = formatDateString(date)
    return sessions.filter(s => s.date === dateStr)
  }

  const navigatePrev = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else if (view === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 7)
      setCurrentDate(newDate)
    } else {
      const newDate = new Date(selectedDay)
      newDate.setDate(selectedDay.getDate() - 1)
      setSelectedDay(newDate)
    }
  }

  const navigateNext = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else if (view === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 7)
      setCurrentDate(newDate)
    } else {
      const newDate = new Date(selectedDay)
      newDate.setDate(selectedDay.getDate() + 1)
      setSelectedDay(newDate)
    }
  }

  const goToToday = () => {
    const today = new Date(2026, 3, 14)
    setCurrentDate(today)
    setSelectedDay(today)
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

  const monthData = getMonthData()
  const today = new Date(2026, 3, 14)

  const getColorForType = (type: string) => {
    switch (type) {
      case "Speech Therapy": return "bg-accent"
      case "Language Development": return "bg-chart-2"
      case "Assessment": return "bg-chart-3"
      default: return "bg-chart-4"
    }
  }

  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.trim().split(" ")
    let [hours, minutes] = time.split(":").map(Number)

    if (period === "PM" && hours !== 12) {
      hours += 12
    }
    if (period === "AM" && hours === 12) {
      hours = 0
    }

    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hrs === 0) return `${mins}m`
    if (mins === 0) return `${hrs}h`
    return `${hrs}h ${mins}m`
  }

  const buildTimeline = (sessionsForDay: Session[]) => {
    if (sessionsForDay.length === 0) return []

    // Sort sessions by time
    const sorted = [...sessionsForDay].sort((a, b) => {
      return timeToMinutes(a.time) - timeToMinutes(b.time)
    })

    const timeline: Array<{
      type: "session" | "travel"
      session?: Session
      freeTime?: string
      travelTime?: string
    }> = []

    sorted.forEach((session, index) => {
      timeline.push({ type: "session", session })

      // Add travel/free time between sessions
      if (index < sorted.length - 1) {
        const currentEnd = timeToMinutes(session.time) + parseInt(session.duration.split(" ")[0])
        const nextStart = timeToMinutes(sorted[index + 1].time)
        const freeMinutes = Math.max(0, nextStart - currentEnd)
        const travelMinutes = Math.max(0, freeMinutes - 10)

        timeline.push({
          type: "travel",
          freeTime: minutesToTime(freeMinutes),
          travelTime: minutesToTime(travelMinutes),
        })
      }
    })

    return timeline
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Calendar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {view === "day"
              ? selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
              : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <Button
              variant={view === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              className="px-2 text-xs sm:px-3 sm:text-sm"
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
              className="px-2 text-xs sm:px-3 sm:text-sm"
            >
              Week
            </Button>
            <Button
              variant={view === "day" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("day")}
              className="px-2 text-xs sm:px-3 sm:text-sm"
            >
              Day
            </Button>
          </div>
          <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOptimizeOpen(true)}
            >
              Optimize
            </Button>
          <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportOpen(true)}
            >
              Import
            </Button>
          <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </DialogTrigger>
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
                  disabled={!newSession.clientId || !newSession.date || !newSession.time || !newSession.address}
                >
                  Schedule Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isOptimizeOpen} onOpenChange={setIsOptimizeOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Optimize Schedule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  This feature is under construction.
                </p>
                <Button
                  className="w-full"
                  onClick={() => setIsOptimizeOpen(false)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Sessions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  This feature is under construction.
                </p>
                <Button
                  className="w-full"
                  onClick={() => setIsImportOpen(false)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={navigatePrev}
          className="px-2 sm:px-3"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Previous</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="text-accent"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={navigateNext}
          className="px-2 sm:px-3"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {view === "month" ? (
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {weekDays.map((day, i) => (
                <div
                  key={day}
                  className="border-r border-border p-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{weekDaysShort[i]}</span>
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {monthData.map((day, i) => {
                const daySessions = getSessionsForDateObj(day.fullDate)
                const isToday = formatDateString(day.fullDate) === formatDateString(today)
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDay(day.fullDate)
                      setView("day")
                    }}
                    className={`relative min-h-[60px] border-b border-r border-border p-1 text-left transition-colors hover:bg-muted/50 sm:min-h-[80px] sm:p-2 ${
                      !day.isCurrentMonth ? "bg-muted/30 text-muted-foreground" : ""
                    } ${i % 7 === 6 ? "border-r-0" : ""}`}
                  >
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs sm:h-6 sm:w-6 sm:text-sm ${
                        isToday
                          ? "bg-accent text-accent-foreground"
                          : day.isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day.date}
                    </span>
                    {/* Session dots/cards */}
                    <div className="mt-1 space-y-0.5">
                      {daySessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className={`hidden truncate rounded px-1 py-0.5 text-[10px] text-accent-foreground sm:block ${getColorForType(session.type)}`}
                        >
                          {session.time} {session.client.split(" ")[0]}
                        </div>
                      ))}
                      {/* Mobile: just dots */}
                      <div className="flex gap-0.5 sm:hidden">
                        {daySessions.slice(0, 3).map((session) => (
                          <div
                            key={session.id}
                            className={`h-1.5 w-1.5 rounded-full ${getColorForType(session.type)}`}
                          />
                        ))}
                      </div>
                      {daySessions.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{daySessions.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : view === "week" ? (
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {weekDates.map((date, i) => {
                const isToday = formatDateString(date) === formatDateString(today)
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDay(date)
                      setView("day")
                    }}
                    className={`border-r border-border p-2 text-center last:border-r-0 hover:bg-muted/50 ${
                      isToday ? "bg-accent/10" : ""
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">
                      <span className="hidden sm:inline">{weekDays[i]}</span>
                      <span className="sm:hidden">{weekDaysShort[i]}</span>
                    </div>
                    <div
                      className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                        isToday
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </button>
                )
              })}
            </div>
            {/* Sessions per day */}
            <div className="grid grid-cols-7">
              {weekDates.map((date, i) => {
                const daySessions = getSessionsForDateObj(date)
                return (
                  <div
                    key={i}
                    className="min-h-[200px] border-r border-border p-1 last:border-r-0 sm:min-h-[300px] sm:p-2"
                  >
                    <div className="space-y-1 sm:space-y-2">
                      {daySessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => handleSessionClick(session)}
                          className={`w-full rounded p-1.5 text-left text-accent-foreground transition-opacity hover:opacity-80 sm:p-2 ${getColorForType(session.type)}`}
                        >
                          <div className="text-[10px] font-medium sm:text-xs">
                            {session.time}
                          </div>
                          <div className="truncate text-[10px] sm:text-xs">
                            {session.client.split(" ")[0]}
                          </div>
                          <div className="truncate text-[10px] opacity-90 sm:text-xs">
                            {session.address}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Timeline View */}
          {getSessionsForDateObj(selectedDay).length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Travel Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-4">
                  {buildTimeline(getSessionsForDateObj(selectedDay)).map((item, idx) => (
                    <div key={idx}>
                      {item.type === "session" ? (
                        // Session Node
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center gap-2 pt-1">
                            <div className="h-3 w-3 rounded-full bg-accent ring-2 ring-accent/30"></div>
                          </div>
                          <div className="flex-1 pb-4">
                            <button
                              onClick={() => handleSessionClick(item.session!)}
                              className="flex w-full items-start gap-3 rounded-lg border border-border/50 p-3 text-left transition-colors hover:border-accent/50 hover:bg-muted/50"
                            >
                              <Avatar className="h-10 w-10 shrink-0 border border-border">
                                <AvatarImage src={item.session!.avatar} alt={item.session!.client} />
                                <AvatarFallback>
                                  {item.session!.client.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                  <span className="font-medium text-foreground text-sm">
                                    {item.session!.client}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      item.session!.status === "confirmed"
                                        ? "bg-accent/10 text-accent"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {item.session!.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {item.session!.type} · {item.session!.duration}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.session!.address}
                                </p>
                                {item.session!.plannedActivities.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.session!.plannedActivities.length} activities planned
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-medium text-foreground text-sm">{item.session!.time}</div>
                                <div className="text-xs text-muted-foreground">{item.session!.duration}</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Travel/Free Time Node
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-0.5 h-8 bg-border"></div>
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="rounded-lg border border-dashed border-muted-foreground/50 bg-muted/30 p-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-xs text-muted-foreground">Free Time</span>
                                  <p className="font-medium text-foreground">{item.freeTime}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Travel Time</span>
                                  <p className="font-medium text-foreground">{item.travelTime}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sessions List */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold sm:text-lg">
                Sessions for {selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getSessionsForDateObj(selectedDay).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No sessions scheduled for this day
                </div>
              ) : (
                getSessionsForDateObj(selectedDay).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionClick(session)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border/50 p-3 text-left transition-colors hover:border-accent/50 hover:bg-muted/50"
                  >
                    <Avatar className="h-10 w-10 shrink-0 border border-border">
                      <AvatarImage src={session.avatar} alt={session.client} />
                      <AvatarFallback>
                        {session.client.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="font-medium text-foreground text-sm">
                          {session.client}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            session.status === "confirmed"
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.type} · {session.duration}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.address}
                      </p>
                      {session.plannedActivities.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {session.plannedActivities.length} activities planned
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium text-foreground text-sm">{session.time}</div>
                      <div className="text-xs text-muted-foreground">{session.duration}</div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
                    <span className="text-xs text-muted-foreground">Date</span>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(selectedSession.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
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
                    {activities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No activities planned</p>
                    ) : (
                      activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                        >
                          <Checkbox
                            id={`cal-activity-${activity.id}`}
                            checked={activity.completed}
                            onCheckedChange={() => toggleActivity(activity.id)}
                          />
                          <label
                            htmlFor={`cal-activity-${activity.id}`}
                            className={`flex-1 text-sm cursor-pointer ${
                              activity.completed
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {activity.name}
                          </label>
                        </div>
                      ))
                    )}
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
                    Save & Close
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
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
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
