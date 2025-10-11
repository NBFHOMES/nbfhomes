"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, Users, TrendingUp, Star, Eye, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Stats {
  totalRevenue: number
  activeBookings: number
  totalGuests: number
  occupancyRate: number
}

interface RecentBooking {
  _id: string
  guestDetails: {
    name: string
  }
  checkIn: string
  checkOut: string
  roomType: string
  status: string
  totalPrice: number
}

const statusColors = {
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function PartnerOverview() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    activeBookings: 0,
    totalGuests: 0,
    occupancyRate: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPartnerData()
    }
  }, [user])

  const fetchPartnerData = async () => {
    try {
      // Fetch partner hotels
      const hotelsResponse = await fetch(`/api/hotels?ownerId=${user?.uid}`)
      const hotelsData = await hotelsResponse.json()
      const hotels = hotelsData.hotels || []

      // Fetch bookings for partner hotels
      const bookingsResponse = await fetch(`/api/bookings`)
      const bookingsData = await bookingsResponse.json()
      const allBookings = bookingsData.bookings || []

      // Filter bookings for partner's hotels
      const hotelIds = hotels.map((h: any) => h._id)
      const partnerBookings = allBookings.filter((b: any) => 
        hotelIds.includes(b.hotelId._id || b.hotelId)
      )

      // Calculate stats
      const totalRevenue = partnerBookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + b.totalPrice, 0)

      const activeBookings = partnerBookings
        .filter((b: any) => b.status === 'confirmed').length

      const totalGuests = partnerBookings
        .reduce((sum: number, b: any) => sum + b.guests, 0)

      const occupancyRate = hotels.length > 0 ? 
        Math.round((activeBookings / (hotels.length * 30)) * 100) : 0

      setStats({
        totalRevenue,
        activeBookings,
        totalGuests,
        occupancyRate
      })

      setRecentBookings(partnerBookings.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch partner data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const statsData = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings.toString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: Calendar,
    },
    {
      title: "Total Guests",
      value: stats.totalGuests.toLocaleString(),
      change: "+15.3%",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      change: "-2.1%",
      trend: "down" as const,
      icon: TrendingUp,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-0" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600 mr-0" />
                )}
                <span
                  className={`text-sm font-medium ml-1 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-0" />
                View All
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent bookings found.</p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{booking.guestDetails.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{booking.roomType}</p>
                      <p className="text-sm text-muted-foreground">₹{booking.totalPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/partner/add-property">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Plus className="h-8 w-8 mx-auto mb-0 text-primary" />
              <h3 className="font-semibold mb-1">Add New Property</h3>
              <p className="text-sm text-muted-foreground">List a new hotel or property</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-0 text-primary" />
            <h3 className="font-semibold mb-1">Manage Reviews</h3>
            <p className="text-sm text-muted-foreground">Respond to guest feedback</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-0 text-primary" />
            <h3 className="font-semibold mb-1">View Analytics</h3>
            <p className="text-sm text-muted-foreground">Track performance metrics</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
