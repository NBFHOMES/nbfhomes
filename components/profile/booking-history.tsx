"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

interface Booking {
  _id: string
  hotelId: {
    _id: string
    name: string
    location: {
      city: string
      country: string
    }
    images: Array<{
      url: string
      alt?: string
    }>
  }
  checkIn: string
  checkOut: string
  guests: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalPrice: number
  createdAt: string
}

const statusColors = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?userId=${user?.uid}`)
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-32 h-20 bg-muted rounded"></div>
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
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No bookings found.</p>
          <Button>Browse Hotels</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex gap-4">
               <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                 <Image
                   src={booking.hotelId.images[0]?.url || "/placeholder.jpg"}
                   alt={booking.hotelId.images[0]?.alt || booking.hotelId.name}
                   width={128}
                   height={80}
                   className="w-full h-full object-cover"
                 />
               </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg truncate">
                      {booking.hotelId.name}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {booking.hotelId.location.city}, {booking.hotelId.location.country}
                    </div>
                  </div>
                  <Badge className={statusColors[booking.status]}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{booking.guests} guests</span>
                  </div>
                  <div className="font-semibold">
                    ${booking.totalPrice}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-muted-foreground">
                    Booked on {formatDate(booking.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {booking.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Star className="w-4 h-4 mr-1" />
                        Rate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
