"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MapPin, Users, Phone, Mail, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Booking {
  _id: string
  hotelId: {
    _id: string
    name: string
  }
  guestDetails: {
    name: string
    email: string
    phone?: string
  }
  checkIn: string
  checkOut: string
  guests: number
  roomType: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

const statusColors = {
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
}

export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, activeTab])

  const fetchBookings = async () => {
    try {
      // Get bookings for partner's hotels directly from API
      const bookingsResponse = await fetch(`/api/bookings?ownerId=${user?.uid}`)
      const bookingsData = await bookingsResponse.json()
      const partnerBookings = bookingsData.bookings || []

      setBookings(partnerBookings)
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
        booking.hotelId.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter(booking => booking.status === activeTab)
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
        setBookings(prev => prev.map(booking => 
          booking._id === bookingId ? { ...booking, status: newStatus as any } : booking
        ))
        toast.success('Booking status updated')
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
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bookings Management</h2>
          <p className="text-muted-foreground">Manage guest reservations and bookings</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name, email, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
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
              {filteredBookings.map((booking) => (
                <Card key={booking._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.guestDetails.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {booking.guestDetails.email}
                          </div>
                          {booking.guestDetails.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {booking.guestDetails.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[booking.status]}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateBookingStatus(booking._id, 'confirmed')}>
                              Confirm Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateBookingStatus(booking._id, 'cancelled')}>
                              Cancel Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateBookingStatus(booking._id, 'completed')}>
                              Mark Completed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Property</p>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="font-medium">{booking.hotelId.name}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Room & Guests</p>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          <span className="font-medium">{booking.roomType} • {booking.guests} guests</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dates</p>
                        <p className="font-medium">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {calculateNights(booking.checkIn, booking.checkOut)} nights
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-semibold text-lg">₹{booking.totalPrice.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-xs text-muted-foreground">
                        Booked on {formatDate(booking.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Contact Guest
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
