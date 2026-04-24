"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Types
export interface Activity {
  id: number
  name: string
  completed: boolean
}

export interface Test {
  id: number
  name: string
  category: string
  description?: string
}

export interface Session {
  id: number
  clientId: number
  client: string
  avatar: string
  date: string
  time: string
  duration: string
  type: string
  address: string
  status: "confirmed" | "pending" | "completed" | "cancelled"
  notes: string
  plannedActivities: Activity[]
}

export interface Message {
  id: number
  clientId: number
  sender: "you" | "patient"
  text: string
  time: string
  read: boolean
}

export interface Client {
  id: number
  name: string
  avatar: string
  age: number
  diagnosis: string
  sessionsPerWeek: number
  nextSession: string
  progress: string
  notes: string
  guardian: string
  phone: string
  email: string
  status: "active" | "on-hold" | "discharged"
}

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialty: string
  bio: string
  avatar: string
  timezone: string
  defaultDuration: string
  startTime: string
  endTime: string
  bufferTime: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    reminders: boolean
  }
}

export interface AuthCredentials {
  username: string
  password: string
}

// Default stored credentials
const defaultAuthCredentials: AuthCredentials = {
  username: "victor",
  password: "password123",
}

// Default Tests/Activities Database
const defaultTests: Test[] = [
  { id: 1, name: "GFTA-3 Articulation Test", category: "Assessment", description: "Goldman-Fristoe Test of Articulation" },
  { id: 2, name: "CELF-5 Language Assessment", category: "Assessment", description: "Clinical Evaluation of Language Fundamentals" },
  { id: 3, name: "Oral Mechanism Exam", category: "Assessment", description: "Evaluation of oral-motor structures" },
  { id: 4, name: "Language Sample Collection", category: "Assessment", description: "Spontaneous language sample" },
  { id: 5, name: "Parent Interview", category: "Assessment", description: "Case history intake" },
  { id: 6, name: "Mirror Exercises", category: "Articulation", description: "Visual feedback for sound production" },
  { id: 7, name: "Word Repetition Drill", category: "Articulation", description: "Repetitive practice of target words" },
  { id: 8, name: "Picture Naming Task", category: "Articulation", description: "Naming pictures with target sounds" },
  { id: 9, name: "Minimal Pairs Therapy", category: "Phonology", description: "Contrasting sound pairs" },
  { id: 10, name: "Phonological Awareness Activities", category: "Phonology", description: "Rhyming, segmenting, blending" },
  { id: 11, name: "Vocabulary Flashcards", category: "Language", description: "Visual vocabulary building" },
  { id: 12, name: "Sentence Building Exercise", category: "Language", description: "Constructing sentences with targets" },
  { id: 13, name: "Pragmatic Language Activities", category: "Language", description: "Social communication skills" },
  { id: 14, name: "Easy Onset Practice", category: "Fluency", description: "Gentle voice initiation" },
  { id: 15, name: "Breathing Exercises", category: "Fluency", description: "Diaphragmatic breathing control" },
  { id: 16, name: "Reading Passage Practice", category: "Fluency", description: "Structured reading with techniques" },
  { id: 17, name: "Motor Planning Exercises", category: "Motor Speech", description: "Sequential movement practice" },
  { id: 18, name: "CVCV Word Practice", category: "Motor Speech", description: "Consonant-vowel patterns" },
  { id: 19, name: "AAC Device Training", category: "AAC", description: "Augmentative communication device use" },
  { id: 20, name: "Vocal Hygiene Education", category: "Voice", description: "Healthy voice use habits" },
]

// Default Clients
const defaultClients: Client[] = [
  {
    id: 1,
    name: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    age: 8,
    diagnosis: "Articulation Disorder",
    sessionsPerWeek: 2,
    nextSession: "Today, 9:00 AM",
    progress: "Good",
    notes: "Focus on 'r' and 's' sounds",
    guardian: "Michael Thompson",
    phone: "(555) 123-4567",
    email: "m.thompson@email.com",
    status: "active",
  },
  {
    id: 2,
    name: "Lucas Martinez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    age: 6,
    diagnosis: "Language Delay",
    sessionsPerWeek: 3,
    nextSession: "Today, 10:00 AM",
    progress: "Improving",
    notes: "Vocabulary building focus",
    guardian: "Maria Martinez",
    phone: "(555) 234-5678",
    email: "m.martinez@email.com",
    status: "active",
  },
  {
    id: 3,
    name: "Sophia Chen",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    age: 10,
    diagnosis: "Stuttering",
    sessionsPerWeek: 1,
    nextSession: "Tomorrow, 11:30 AM",
    progress: "Stable",
    notes: "Fluency techniques",
    guardian: "Wei Chen",
    phone: "(555) 345-6789",
    email: "w.chen@email.com",
    status: "active",
  },
  {
    id: 4,
    name: "Noah Williams",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    age: 7,
    diagnosis: "Apraxia of Speech",
    sessionsPerWeek: 2,
    nextSession: "Today, 2:00 PM",
    progress: "Good",
    notes: "Motor planning exercises",
    guardian: "Sarah Williams",
    phone: "(555) 456-7890",
    email: "s.williams@email.com",
    status: "active",
  },
  {
    id: 5,
    name: "Mia Johnson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    age: 5,
    diagnosis: "Phonological Disorder",
    sessionsPerWeek: 2,
    nextSession: "Apr 16, 3:00 PM",
    progress: "Improving",
    notes: "Pattern-based approach",
    guardian: "Robert Johnson",
    phone: "(555) 567-8901",
    email: "r.johnson@email.com",
    status: "active",
  },
  {
    id: 6,
    name: "Oliver Brown",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    age: 9,
    diagnosis: "Voice Disorder",
    sessionsPerWeek: 1,
    nextSession: "Apr 17, 10:00 AM",
    progress: "Stable",
    notes: "Vocal hygiene education",
    guardian: "Jennifer Brown",
    phone: "(555) 678-9012",
    email: "j.brown@email.com",
    status: "on-hold",
  },
]

// Default User Profile
const defaultUserProfile: UserProfile = {
  firstName: "Victor",
  lastName: "Chen",
  email: "victor.chen@clarity.health",
  phone: "(555) 123-4567",
  specialty: "speech",
  bio: "Certified Speech-Language Pathologist with 10+ years of experience working with children. Specialized in articulation disorders and language development.",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  timezone: "pst",
  defaultDuration: "45",
  startTime: "08:00",
  endTime: "18:00",
  bufferTime: "15",
  notifications: {
    email: true,
    sms: false,
    push: true,
    reminders: true,
  },
}

// Default Sessions (freeform - just date based, no time slots)
const defaultMessages: Message[] = [
  { id: 1, clientId: 1, sender: "patient", text: "Hi Dr. Chen, I have questions about tomorrow's session.", time: "9:15 AM", read: false },
  { id: 2, clientId: 1, sender: "you", text: "Sure, let's review your goals and plan a quick warm-up.", time: "9:18 AM", read: true },
  { id: 3, clientId: 2, sender: "patient", text: "Can we move our appointment to the afternoon?", time: "11:02 AM", read: false },
  { id: 4, clientId: 2, sender: "you", text: "Yes, I have openings after 2:00 PM. Which time works best?", time: "11:05 AM", read: true },
  { id: 5, clientId: 3, sender: "patient", text: "I finished the speech exercises you sent.", time: "8:30 AM", read: false },
  { id: 6, clientId: 3, sender: "you", text: "Great work! I'll add a new activity for next time.", time: "8:35 AM", read: true },
]

const defaultSessions: Session[] = [
  {
    id: 1,
    clientId: 1,
    client: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-14",
    time: "9:00 AM",
    duration: "45 min",
    type: "Speech Therapy",
    address: "Tampa Bay Elementary, 1200 Palm Ave, Tampa, FL 33602",
    status: "confirmed",
    notes: "",
    plannedActivities: [
      { id: 1, name: "Mirror Exercises", completed: false },
      { id: 2, name: "Word Repetition Drill", completed: false },
      { id: 3, name: "Picture Naming Task", completed: false },
    ],
  },
  {
    id: 2,
    clientId: 2,
    client: "Lucas Martinez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-14",
    time: "10:30 AM",
    duration: "30 min",
    type: "Language Development",
    address: "Sunshine Learning Center, 455 Oak St, Tampa, FL 33603",
    status: "confirmed",
    notes: "",
    plannedActivities: [
      { id: 1, name: "Vocabulary Flashcards", completed: false },
      { id: 2, name: "Sentence Building Exercise", completed: false },
    ],
  },
  {
    id: 3,
    clientId: 3,
    client: "Sophia Chen",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-14",
    time: "1:00 PM",
    duration: "60 min",
    type: "Assessment",
    address: "Westshore Pediatric Clinic, 2201 Westshore Blvd, Tampa, FL 33607",
    status: "pending",
    notes: "",
    plannedActivities: [
      { id: 1, name: "GFTA-3 Articulation Test", completed: false },
      { id: 2, name: "Language Sample Collection", completed: false },
      { id: 3, name: "Parent Interview", completed: false },
    ],
  },
  {
    id: 4,
    clientId: 4,
    client: "Noah Williams",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-14",
    time: "3:00 PM",
    duration: "45 min",
    type: "Speech Therapy",
    address: "North Tampa Therapy Hub, 7802 Fletcher Ave, Tampa, FL 33637",
    status: "confirmed",
    notes: "",
    plannedActivities: [
      { id: 1, name: "Easy Onset Practice", completed: false },
      { id: 2, name: "Breathing Exercises", completed: false },
    ],
  },
  {
    id: 5,
    clientId: 5,
    client: "Mia Johnson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-15",
    time: "9:30 AM",
    duration: "45 min",
    type: "Speech Therapy",
    address: "Harborview Elementary, 310 Bayshore Dr, Tampa, FL 33606",
    status: "confirmed",
    notes: "",
    plannedActivities: [
      { id: 1, name: "Minimal Pairs Therapy", completed: false },
      { id: 2, name: "Phonological Awareness Activities", completed: false },
    ],
  },
  {
    id: 6,
    clientId: 6,
    client: "Oliver Brown",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-16",
    time: "10:00 AM",
    duration: "30 min",
    type: "Speech Therapy",
    address: "South Tampa Voice Center, 1508 S Dale Mabry Hwy, Tampa, FL 33629",
    status: "confirmed",
    notes: "",
    plannedActivities: [
      { id: 1, name: "Vocal Hygiene Education", completed: false },
    ],
  },
  {
    id: 7,
    clientId: 1,
    client: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-17",
    time: "9:00 AM",
    duration: "45 min",
    type: "Speech Therapy",
    address: "Tampa Bay Elementary, 1200 Palm Ave, Tampa, FL 33602",
    status: "confirmed",
    notes: "",
    plannedActivities: [
      { id: 1, name: "Mirror Exercises", completed: false },
    ],
  },
  // Past sessions
  {
    id: 101,
    clientId: 1,
    client: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-12",
    time: "9:00 AM",
    duration: "45 min",
    type: "Speech Therapy",
    address: "Tampa Bay Elementary, 1200 Palm Ave, Tampa, FL 33602",
    status: "completed",
    notes: "Great progress on 'r' sounds today. Emma successfully produced the sound in isolation and in simple words.",
    plannedActivities: [
      { id: 1, name: "Mirror Exercises", completed: true },
      { id: 2, name: "Word Repetition Drill", completed: true },
    ],
  },
  {
    id: 102,
    clientId: 2,
    client: "Lucas Martinez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-12",
    time: "10:00 AM",
    duration: "30 min",
    type: "Language Development",
    address: "Sunshine Learning Center, 455 Oak St, Tampa, FL 33603",
    status: "completed",
    notes: "Introduced new vocabulary set: household items. Lucas demonstrated good retention.",
    plannedActivities: [
      { id: 1, name: "Vocabulary Flashcards", completed: true },
      { id: 2, name: "Sentence Building Exercise", completed: true },
    ],
  },
  {
    id: 103,
    clientId: 5,
    client: "Mia Johnson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    date: "2026-04-11",
    time: "3:00 PM",
    duration: "60 min",
    type: "Assessment",
    address: "Children's Evaluation Center, 901 River Ave, Tampa, FL 33602",
    status: "completed",
    notes: "Completed initial assessment. Results indicate phonological disorder affecting consonant clusters.",
    plannedActivities: [
      { id: 1, name: "GFTA-3 Articulation Test", completed: true },
      { id: 2, name: "Oral Mechanism Exam", completed: true },
    ],
  },
]

// Context Type
interface DataContextType {
  // Tests/Activities Database
  tests: Test[]
  addTest: (test: Omit<Test, "id">) => void
  deleteTest: (id: number) => void
  
  // Clients
  clients: Client[]
  addClient: (client: Omit<Client, "id">) => void
  updateClient: (id: number, updates: Partial<Client>) => void
  
  // Sessions
  sessions: Session[]
  addSession: (session: Omit<Session, "id">) => void
  updateSession: (id: number, updates: Partial<Session>) => void
  getSessionsForDate: (date: string) => Session[]
  getSessionsForClient: (clientId: number) => Session[]
  getUpcomingSessions: () => Session[]
  getPastSessions: () => Session[]
  getTodaysSessions: () => Session[]

  // Messages
  messages: Message[]
  addMessage: (message: Omit<Message, "id" | "time" | "read">) => void
  markMessagesRead: (clientId: number) => void
  getMessagesForClient: (clientId: number) => Message[]
  getUnreadCountForClient: (clientId: number) => number

  // User Profile
  userProfile: UserProfile
  updateUserProfile: (updates: Partial<UserProfile>) => void

  // Authentication
  isLoggedIn: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [tests, setTests] = useState<Test[]>(defaultTests)
  const [clients, setClients] = useState<Client[]>(defaultClients)
  const [sessions, setSessions] = useState<Session[]>(defaultSessions)
  const [messages, setMessages] = useState<Message[]>(defaultMessages)
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const addTest = (test: Omit<Test, "id">) => {
    setTests(prev => [...prev, { ...test, id: Date.now() }])
  }

  const deleteTest = (id: number) => {
    setTests(prev => prev.filter(t => t.id !== id))
  }

  const addClient = (client: Omit<Client, "id">) => {
    setClients(prev => [...prev, { ...client, id: Date.now() }])
  }

  const updateClient = (id: number, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const addSession = (session: Omit<Session, "id">) => {
    setSessions(prev => [...prev, { ...session, id: Date.now() }])
  }

  const updateSession = (id: number, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const addMessage = (message: Omit<Message, "id" | "time" | "read">) => {
    setMessages(prev => [
      ...prev,
      {
        ...message,
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: message.sender === "you",
      },
    ])
  }

  const markMessagesRead = (clientId: number) => {
    setMessages(prev => {
      let needsUpdate = false
      const updated = prev.map((message) => {
        if (message.clientId === clientId && !message.read && message.sender === "patient") {
          needsUpdate = true
          return { ...message, read: true }
        }
        return message
      })
      return needsUpdate ? updated : prev
    })
  }

  const getSessionsForDate = (date: string) => {
    return sessions.filter(s => s.date === date)
  }

  const getSessionsForClient = (clientId: number) => {
    return sessions.filter(s => s.clientId === clientId)
  }

  const getMessagesForClient = (clientId: number) => {
    return messages
      .filter(message => message.clientId === clientId)
      .sort((a, b) => a.id - b.id)
  }

  const getUnreadCountForClient = (clientId: number) => {
    return messages.filter(message => message.clientId === clientId && !message.read && message.sender === "patient").length
  }

  const today = "2026-04-14"

  const getUpcomingSessions = () => {
    return sessions.filter(s => s.date >= today && s.status !== "completed")
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.time.localeCompare(b.time)
      })
  }

  const getPastSessions = () => {
    return sessions.filter(s => s.status === "completed")
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  const getTodaysSessions = () => {
    return sessions.filter(s => s.date === today)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }))
  }

  const login = (username: string, password: string): boolean => {
    if (username === defaultAuthCredentials.username && password === defaultAuthCredentials.password) {
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  const logout = () => {
    setIsLoggedIn(false)
  }

  return (
    <DataContext.Provider
      value={{
        tests,
        addTest,
        deleteTest,
        clients,
        addClient,
        updateClient,
        sessions,
        addSession,
        updateSession,
        getSessionsForDate,
        getSessionsForClient,
        getUpcomingSessions,
        getPastSessions,
        getTodaysSessions,
        messages,
        addMessage,
        markMessagesRead,
        getMessagesForClient,
        getUnreadCountForClient,
        userProfile,
        updateUserProfile,
        isLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
