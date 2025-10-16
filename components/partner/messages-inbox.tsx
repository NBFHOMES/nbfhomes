"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Mail, AlertCircle, Send, Reply, Clock, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Message {
  _id: string
  type: 'inquiry' | 'support' | 'booking'
  subject: string
  message: string
  sender: {
    name: string
    email: string
  }
  recipient: string
  status: 'unread' | 'read' | 'replied'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  replies?: Array<{
    message: string
    sender: string
    createdAt: string
  }>
}

export function PartnerMessagesInbox() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [replying, setReplying] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?userId=${user?.uid}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReplyToMessage = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setReplying(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: selectedMessage._id,
          status: 'replied',
          replies: [
            ...(selectedMessage.replies || []),
            {
              message: replyText,
              sender: 'You',
              senderId: user?.uid,
              createdAt: new Date().toISOString()
            }
          ]
        })
      })

      if (response.ok) {
        toast.success("Reply sent successfully!")
        setShowReplyDialog(false)
        setReplyText("")
        setSelectedMessage(null)
        fetchMessages() // Refresh messages
      } else {
        throw new Error('Failed to send reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error("Failed to send reply")
    } finally {
      setReplying(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          status: 'read'
        })
      })

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg._id === messageId && msg.status === 'unread'
          ? { ...msg, status: 'read' as const }
          : msg
      ))
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Mail className="h-4 w-4 text-blue-500" />
      case 'read': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'replied': return <Reply className="h-4 w-4 text-purple-500" />
      default: return <Mail className="h-4 w-4 text-gray-500" />
    }
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length
  const highPriorityCount = messages.filter(m => m.priority === 'high' && m.status === 'unread').length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{highPriorityCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">
                  {messages.length > 0 ? Math.round((messages.filter(m => m.status === 'replied').length / messages.length) * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Messages ({messages.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority ({highPriorityCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <MessagesList
            messages={messages}
            onMessageClick={(msg) => {
              markAsRead(msg._id)
              setSelectedMessage(msg)
              setShowReplyDialog(true)
            }}
            getPriorityColor={getPriorityColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <MessagesList
            messages={messages.filter(m => m.status === 'unread')}
            onMessageClick={(msg) => {
              markAsRead(msg._id)
              setSelectedMessage(msg)
              setShowReplyDialog(true)
            }}
            getPriorityColor={getPriorityColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>

        <TabsContent value="high-priority" className="space-y-4">
          <MessagesList
            messages={messages.filter(m => m.priority === 'high')}
            onMessageClick={(msg) => {
              markAsRead(msg._id)
              setSelectedMessage(msg)
              setShowReplyDialog(true)
            }}
            getPriorityColor={getPriorityColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedMessage.sender.name}</span>
                  <Badge className={getPriorityColor(selectedMessage.priority)}>
                    {selectedMessage.priority}
                  </Badge>
                </div>
                <p className="font-medium mb-1">{selectedMessage.subject}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
                <p>{selectedMessage.message}</p>
              </div>

              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Previous Replies</h4>
                  {selectedMessage.replies.map((reply, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{reply.sender}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Your Reply</label>
                <Textarea
                  placeholder="Type your response here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReplyToMessage} disabled={replying || !replyText.trim()}>
              {replying ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MessagesList({
  messages,
  onMessageClick,
  getPriorityColor,
  getStatusIcon
}: {
  messages: Message[]
  onMessageClick: (message: Message) => void
  getPriorityColor: (priority: string) => string
  getStatusIcon: (status: string) => JSX.Element
}) {
  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No messages found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message._id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1" onClick={() => onMessageClick(message)}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{message.subject}</h3>
                  <Badge className={getPriorityColor(message.priority)}>
                    {message.priority}
                  </Badge>
                  {getStatusIcon(message.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  From: {message.sender.name} • {new Date(message.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-700 line-clamp-2">{message.message}</p>
                {message.replies && message.replies.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {message.replies.length} reply(ies)
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessageClick(message)}
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}