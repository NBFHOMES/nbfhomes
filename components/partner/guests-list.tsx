"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, Mail, Phone, Calendar, DollarSign, Star, MessageSquare, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Guest {
  _id: string
  displayName: string
  email: string
  phoneNumber?: string
  totalBookings: number
  totalSpent: number
  averageRating: number
  lastBooking: string
  status: 'active' | 'inactive'
  vipStatus: boolean
  bookings: Array<{
    _id: string
    hotelName: string
    checkIn: string
    checkOut: string
    totalPrice: number
    status: string
  }>
}

export function PartnerGuestsList() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [showGuestDialog, setShowGuestDialog] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchGuests()
    }
  }, [user])

  const fetchGuests = async () => {
    try {
      // Fetch bookings for partner's hotels directly
      const bookingsResponse = await fetch(`/api/bookings?ownerId=${user?.uid}`)
      const bookingsData = await bookingsResponse.json()
      const partnerBookings = bookingsData.bookings || []

      // Group bookings by guest
      const guestMap: { [key: string]: Guest } = {}

      partnerBookings.forEach((booking: any) => {
        const guestId = booking.guestId || booking.userId
        const guestEmail = booking.guestDetails?.email || booking.userId

        if (!guestMap[guestEmail]) {
          guestMap[guestEmail] = {
            _id: guestId,
            displayName: booking.guestDetails?.name || 'Unknown Guest',
            email: guestEmail,
            phoneNumber: booking.guestDetails?.phone,
            totalBookings: 0,
            totalSpent: 0,
            averageRating: 0,
            lastBooking: booking.createdAt,
            status: 'active',
            vipStatus: false,
            bookings: []
          }
        }

        const guest = guestMap[guestEmail]
        guest.totalBookings++
        guest.totalSpent += booking.totalPrice
        guest.bookings.push({
          _id: booking._id,
          hotelName: booking.hotelId?.name || 'Unknown Hotel',
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          totalPrice: booking.totalPrice,
          status: booking.status
        })

        // Update last booking date
        if (new Date(booking.createdAt) > new Date(guest.lastBooking)) {
          guest.lastBooking = booking.createdAt
        }
      })

      // Fetch reviews for rating calculation
      const reviewsResponse = await fetch(`/api/reviews?ownerId=${user?.uid}`)
      const reviewsData = await reviewsResponse.json()
      const reviews = reviewsData.reviews || []

      // Calculate VIP status and ratings (guests with > 3 bookings or > $2000 spent)
      Object.values(guestMap).forEach(guest => {
        guest.vipStatus = guest.totalBookings > 3 || guest.totalSpent > 2000

        // Calculate average rating from reviews
        const guestReviews = reviews.filter((review: any) => review.userId === guest._id)
        if (guestReviews.length > 0) {
          guest.averageRating = guestReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / guestReviews.length
        } else {
          guest.averageRating = 0 // No reviews yet
        }
      })

      const guestsList = Object.values(guestMap)
      setGuests(guestsList)
    } catch (error) {
      console.error('Failed to fetch guests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGuests = guests.filter(guest =>
    guest.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const vipGuests = filteredGuests.filter(g => g.vipStatus)
  const regularGuests = filteredGuests.filter(g => !g.vipStatus)

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
      {/* Guest Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">{guests.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">VIP Guests</p>
                <p className="text-2xl font-bold">{vipGuests.length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₹{guests.reduce((sum, g) => sum + g.totalSpent, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">
                  {(guests.reduce((sum, g) => sum + g.averageRating, 0) / guests.length || 0).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Guests Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Guests ({filteredGuests.length})</TabsTrigger>
          <TabsTrigger value="vip">VIP Guests ({vipGuests.length})</TabsTrigger>
          <TabsTrigger value="regular">Regular Guests ({regularGuests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <GuestsGrid
            guests={filteredGuests}
            onGuestClick={(guest) => {
              setSelectedGuest(guest)
              setShowGuestDialog(true)
            }}
          />
        </TabsContent>

        <TabsContent value="vip" className="space-y-4">
          <GuestsGrid
            guests={vipGuests}
            onGuestClick={(guest) => {
              setSelectedGuest(guest)
              setShowGuestDialog(true)
            }}
          />
        </TabsContent>

        <TabsContent value="regular" className="space-y-4">
          <GuestsGrid
            guests={regularGuests}
            onGuestClick={(guest) => {
              setSelectedGuest(guest)
              setShowGuestDialog(true)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Guest Details Dialog */}
      <Dialog open={showGuestDialog} onOpenChange={setShowGuestDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedGuest?.displayName}
              {selectedGuest?.vipStatus && (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  VIP
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedGuest && (
            <div className="space-y-6">
              {/* Guest Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedGuest.email}
                    </p>
                  </div>
                  {selectedGuest.phoneNumber && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedGuest.phoneNumber}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Booking</label>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedGuest.lastBooking).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Bookings</label>
                    <p className="text-2xl font-bold">{selectedGuest.totalBookings}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Spent</label>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{selectedGuest.totalSpent.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Average Rating</label>
                    <p className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      {selectedGuest.averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking History */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Booking History</h3>
                <div className="space-y-3">
                  {selectedGuest.bookings.map((booking) => (
                    <div key={booking._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{booking.hotelName}</h4>
                        <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Check-in:</span> {new Date(booking.checkIn).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Check-out:</span> {new Date(booking.checkOut).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> ₹{booking.totalPrice.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGuestDialog(false)}>
              Close
            </Button>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GuestsGrid({
  guests,
  onGuestClick
}: {
  guests: Guest[]
  onGuestClick: (guest: Guest) => void
}) {
  if (guests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No guests found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guests.map((guest) => (
        <Card key={guest._id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{guest.displayName}</h3>
                  {guest.vipStatus && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      VIP
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{guest.email}</p>
                <p className="text-sm text-muted-foreground">
                  {guest.totalBookings} booking{guest.totalBookings !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Total Spent:</span>
                <span className="font-medium text-green-600">₹{guest.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Rating:</span>
                <span className="font-medium">{guest.averageRating.toFixed(1)} ⭐</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Booking:</span>
                <span className="font-medium">{new Date(guest.lastBooking).toLocaleDateString()}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onGuestClick(guest)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}