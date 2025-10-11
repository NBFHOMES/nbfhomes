"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Search, Filter, MoreHorizontal, User, Clock, AlertTriangle, CheckCircle, XCircle, Mail, Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface SupportTicket {
  _id: string
  ticketId: string
  userId: string
  userEmail: string
  userName: string
  subject: string
  description: string
  category: 'booking' | 'payment' | 'account' | 'hotel' | 'technical' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed'
  assignedTo?: string
  tags: string[]
  messages: Array<{
    senderId: string
    senderName: string
    senderType: 'user' | 'admin'
    message: string
    isInternal: boolean
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
  lastActivity: string
}

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  waiting_for_user: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const categoryColors = {
  booking: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  payment: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  account: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  hotel: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  technical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

const statusIcons = {
  open: AlertTriangle,
  in_progress: Clock,
  waiting_for_user: User,
  resolved: CheckCircle,
  closed: XCircle,
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [tickets, searchTerm, activeTab, statusFilter, priorityFilter, categoryFilter])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/support')
      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Failed to fetch support tickets:', error)
      toast.error('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  const filterTickets = () => {
    let filtered = tickets

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status tab
    if (activeTab !== "all") {
      filtered = filtered.filter(ticket => ticket.status === activeTab)
    }

    // Filter by status dropdown
    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.status === statusFilter)
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter)
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter)
    }

    setFilteredTickets(filtered)
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(prev => prev.map(ticket =>
          ticket._id === ticketId ? { ...ticket, status: newStatus as any } : ticket
        ))
        toast.success(`Ticket ${newStatus.replace('_', ' ')}`)
      } else {
        throw new Error('Failed to update ticket')
      }
    } catch (error) {
      toast.error('Failed to update ticket status')
    }
  }

  const assignTicket = async (ticketId: string, adminId: string) => {
    try {
      const response = await fetch(`/api/support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: adminId })
      })

      if (response.ok) {
        setTickets(prev => prev.map(ticket =>
          ticket._id === ticketId ? { ...ticket, assignedTo: adminId } : ticket
        ))
        toast.success('Ticket assigned successfully')
      } else {
        throw new Error('Failed to assign ticket')
      }
    } catch (error) {
      toast.error('Failed to assign ticket')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusStats = () => {
    const stats = {
      all: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      waiting_for_user: tickets.filter(t => t.status === 'waiting_for_user').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
    }
    return stats
  }

  const getPriorityStats = () => {
    return {
      urgent: tickets.filter(t => t.priority === 'urgent').length,
      high: tickets.filter(t => t.priority === 'high').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      low: tickets.filter(t => t.priority === 'low').length,
    }
  }

  const stats = getStatusStats()
  const priorityStats = getPriorityStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                    <div className="h-8 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Support <span className="text-gradient">Center</span>
        </h1>
        <p className="text-muted-foreground">Manage customer support tickets and inquiries</p>
      </div>

      {/* Priority Alerts */}
      {(priorityStats.urgent > 0 || priorityStats.high > 0) && (
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">
                  {priorityStats.urgent > 0 && `${priorityStats.urgent} urgent, `}
                  {priorityStats.high > 0 && `${priorityStats.high} high priority `}
                  tickets require immediate attention
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket ID, subject, user name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting_for_user">Waiting</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="account">Account</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
          <TabsTrigger value="open">Open ({stats.open})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({stats.in_progress})</TabsTrigger>
          <TabsTrigger value="waiting_for_user">Waiting ({stats.waiting_for_user})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({stats.closed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? "No tickets found matching your search." : "No tickets found."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTickets.map((ticket) => {
                const StatusIcon = statusIcons[ticket.status]
                const lastMessage = ticket.messages[ticket.messages.length - 1]
                return (
                  <Card key={ticket._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <span className="font-medium">{ticket.ticketId}</span>
                                <span className="mx-2">•</span>
                                <span>{ticket.userName}</span>
                                <span className="mx-2">•</span>
                                <span>{ticket.userEmail}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[ticket.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                              </Badge>
                              <Badge className={priorityColors[ticket.priority]}>
                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                              </Badge>
                              <Badge className={categoryColors[ticket.category]}>
                                {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    View Conversation
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => assignTicket(ticket._id, 'admin-1')}>
                                    <User className="h-4 w-4 mr-2" />
                                    Assign to Me
                                  </DropdownMenuItem>
                                  {ticket.status === 'open' && (
                                    <DropdownMenuItem onClick={() => updateTicketStatus(ticket._id, 'in_progress')}>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Start Working
                                    </DropdownMenuItem>
                                  )}
                                  {ticket.status === 'in_progress' && (
                                    <>
                                      <DropdownMenuItem onClick={() => updateTicketStatus(ticket._id, 'waiting_for_user')}>
                                        <User className="h-4 w-4 mr-2" />
                                        Wait for User
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updateTicketStatus(ticket._id, 'resolved')}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Resolve
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {ticket.status === 'waiting_for_user' && (
                                    <DropdownMenuItem onClick={() => updateTicketStatus(ticket._id, 'in_progress')}>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Continue
                                    </DropdownMenuItem>
                                  )}
                                  {(ticket.status === 'resolved' || ticket.status === 'waiting_for_user') && (
                                    <DropdownMenuItem onClick={() => updateTicketStatus(ticket._id, 'closed')}>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Close Ticket
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {ticket.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p className="font-semibold">{formatDate(ticket.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Activity</p>
                              <p className="font-semibold">{formatDate(ticket.lastActivity)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Messages</p>
                              <p className="font-semibold">{ticket.messages.length}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Assigned To</p>
                              <p className="font-semibold">
                                {ticket.assignedTo ? `Admin ${ticket.assignedTo.slice(-4)}` : 'Unassigned'}
                              </p>
                            </div>
                          </div>

                          {lastMessage && (
                            <div className="bg-muted/50 rounded-lg p-3 mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  {lastMessage.senderType === 'admin' ? 'You' : lastMessage.senderName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(lastMessage.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm line-clamp-2">{lastMessage.message}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex gap-2">
                              {ticket.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4 mr-1" />
                                Email
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}