"use client"

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useData, type Client, type Message } from "@/lib/data-context"

export function MessagesView({ initialClientId }: { initialClientId?: number }) {
  const {
    clients,
    getMessagesForClient,
    addMessage,
    getUnreadCountForClient,
    markMessagesRead,
  } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<number>(clients[0]?.id ?? 0)
  const [messageDraft, setMessageDraft] = useState("")
  const [isConversationOpen, setIsConversationOpen] = useState(false)

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [clients, searchQuery])

  const selectedClient = useMemo(() => {
    return clients.find((client) => client.id === selectedClientId) ?? filteredClients[0] ?? clients[0]
  }, [clients, filteredClients, selectedClientId])

  const selectedMessages = useMemo(
    () => (selectedClient ? getMessagesForClient(selectedClient.id) : []),
    [getMessagesForClient, selectedClient]
  )

  const selectedClientUnread = useMemo(
    () => selectedClient ? getUnreadCountForClient(selectedClient.id) : 0,
    [getUnreadCountForClient, selectedClient]
  )

  useEffect(() => {
    if (initialClientId !== undefined) {
      setSelectedClientId(initialClientId)
      setIsConversationOpen(true)
    }
  }, [initialClientId])

  useEffect(() => {
    if (selectedClientId && isConversationOpen && selectedClientUnread > 0) {
      markMessagesRead(selectedClientId)
    }
  }, [selectedClientId, isConversationOpen, selectedClientUnread, markMessagesRead])

  const handleSendMessage = () => {
    if (!selectedClient || !messageDraft.trim()) {
      return
    }

    addMessage({
      clientId: selectedClient.id,
      sender: "you",
      text: messageDraft.trim(),
    })
    setMessageDraft("")
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="client-search">Search patients</Label>
            <Input
              id="client-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name"
            />
          </div>

          <div className="space-y-2">
            {filteredClients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No patients match your search.
              </div>
            ) : (
              filteredClients.map((client) => {
                const unreadCount = getUnreadCountForClient(client.id)
                return (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id)
                      setIsConversationOpen(true)
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                      client.id === selectedClient?.id
                        ? "border-accent bg-accent/10"
                        : "border-transparent hover:bg-accent/5"
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback>{client.name.split(" ").map((part) => part[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{client.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{client.diagnosis}</p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConversationOpen} onOpenChange={setIsConversationOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={selectedClient?.avatar} alt={selectedClient?.name} />
                  <AvatarFallback>{selectedClient?.name.split(" ").map((part) => part[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle>Conversation with {selectedClient?.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground">Use the X in the top corner to close.</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              {selectedMessages.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-muted p-8 text-center text-sm text-muted-foreground">
                  No messages yet. Send one to start the conversation.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                        message.sender === "you"
                          ? "ml-auto bg-accent text-accent-foreground"
                          : "bg-card text-foreground"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{message.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-draft">Write a message</Label>
              <Textarea
                id="message-draft"
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                placeholder="Type your message to the patient"
                className="min-h-[120px]"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSendMessage} disabled={!messageDraft.trim()}>
                Send message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
