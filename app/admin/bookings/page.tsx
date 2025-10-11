"use client"

import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Filter, MoreHorizontal, MapPin, DollarSign, Users, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Booking {
  _id: string
  userId: string
  hotelId: {
    _id: string
    name: string
    location: {
      city: string
      country: string
    }
  }
  checkIn: string
  checkOut: string
  guests: number
  roomType: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  guestDetails: {
    name: string
    email: string
    phone?: string
  }
  createdAt: string
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

const paymentStatusColors = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  cancelled: XCircle,
  completed: CheckCircle,
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, activeTab, statusFilter, paymentFilter])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.guestDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guestDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.hotelId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.hotelId.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status tab
    if (activeTab !== "all") {
      filtered = filtered.filter(booking => booking.status === activeTab)
    }

    // Filter by status dropdown
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Filter by payment status
    if (paymentFilter !== "all") {
      filtered = filtered.filter(booking => booking.paymentStatus === paymentFilter)
    }

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(prev => prev.map(booking =>
          booking._id === bookingId ? { ...booking, status: newStatus as any } : booking
        ))
        toast.success(`Booking ${newStatus}`)
      } else {
        throw new Error('Failed to update booking')
      }
    } catch (error) {
      toast.error('Failed to update booking status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getStatusStats = () => {
    const stats = {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length,
    }
    return stats
  }

  const stats = getStatusStats()

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
              Booking <span className="text-gradient">Management</span>
            </h1>
            <p className="text-muted-foreground">Monitor and manage all platform bookings</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name, email, hotel, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      {searchTerm ? "No bookings found matching your search." : "No bookings found."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredBookings.map((booking) => {
                    const StatusIcon = statusIcons[booking.status]
                    const nights = calculateNights(booking.checkIn, booking.checkOut)
                    return (
                      <Card key={booking._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg">{booking.guestDetails.name}</h3>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {booking.hotelId.name} - {booking.hotelId.location.city}, {booking.hotelId.location.country}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={statusColors[booking.status]}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </Badge>
                                  <Badge className={paymentStatusColors[booking.paymentStatus]}>
                                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                                  </Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {booking.status === 'pending' && (
                                        <>
                                          <DropdownMenuItem onClick={() => updateBookingStatus(booking._id, 'confirmed')}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Confirm
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => updateBookingStatus(booking._id, 'cancelled')}>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      {booking.status === 'confirmed' && (
                                        <DropdownMenuItem onClick={() => updateBookingStatus(booking._id, 'cancelled')}>
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Cancel
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3">
                                {booking.guestDetails.email} • {booking.guestDetails.phone || 'No phone'}
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Check-in</p>
                                  <p className="font-semibold">{formatDate(booking.checkIn)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Check-out</p>
                                  <p className="font-semibold">{formatDate(booking.checkOut)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Guests</p>
                                  <div className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    <span className="font-semibold">{booking.guests}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Total</p>
                                  <div className="flex items-center">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    <span className="font-semibold">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <span className="text-xs text-muted-foreground">
                                  {booking.roomType} • {nights} night{nights !== 1 ? 's' : ''} • Booked on {formatDate(booking.createdAt)}
                                </span>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                  {booking.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                      >
                                        Confirm
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  )}
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