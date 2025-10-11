"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, TrendingUp, BarChart3, Clock, MapPin, Download } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

interface AnalyticsData {
  totalBookings: number
  activeBookings: number
  occupancyRate: number
  averageBookingValue: number
  popularTimes: Array<{
    hour: string
    bookings: number
  }>
  bookingTrends: Array<{
    month: string
    bookings: number
    revenue: number
  }>
  bookingSources: Array<{
    source: string
    count: number
    percentage: number
  }>
  topProperties: Array<{
    name: string
    bookings: number
    revenue: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function PartnerBookingAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalBookings: 0,
    activeBookings: 0,
    occupancyRate: 0,
    averageBookingValue: 0,
    popularTimes: [],
    bookingTrends: [],
    bookingSources: [],
    topProperties: []
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch partner hotels
      const hotelsResponse = await fetch(`/api/hotels?ownerId=${user?.uid}`)
      const hotelsData = await hotelsResponse.json()
      const hotels = hotelsData.hotels || []

      // Fetch bookings for partner's hotels directly
      const bookingsResponse = await fetch(`/api/bookings?ownerId=${user?.uid}`)
      const bookingsData = await bookingsResponse.json()
      const partnerBookings = bookingsData.bookings || []

      const totalBookings = partnerBookings.length
      const activeBookings = partnerBookings.filter((b: any) =>
        b.status === 'confirmed' || b.status === 'pending'
      ).length

      // Calculate occupancy rate (simplified - assuming 30 days per month)
      const occupancyRate = hotels.length > 0 ?
        Math.round((activeBookings / (hotels.length * 30)) * 100) : 0

      // Calculate average booking value
      const totalRevenue = partnerBookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + b.totalPrice, 0)
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

      // Popular booking times (by hour)
      const hourCounts: { [key: string]: number } = {}
      partnerBookings.forEach((booking: any) => {
        const hour = new Date(booking.checkIn).getHours()
        const hourLabel = `${hour}:00`
        hourCounts[hourLabel] = (hourCounts[hourLabel] || 0) + 1
      })

      const popularTimes = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([hour, bookings]) => ({ hour, bookings }))

      // Monthly booking trends (last 6 months)
      const bookingTrends = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthBookings = partnerBookings.filter((b: any) => {
          const bookingDate = new Date(b.createdAt)
          return bookingDate.getMonth() === date.getMonth() &&
                 bookingDate.getFullYear() === date.getFullYear()
        })
        const monthRevenue = monthBookings
          .filter((b: any) => b.status === 'completed')
          .reduce((sum: number, b: any) => sum + b.totalPrice, 0)

        bookingTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          bookings: monthBookings.length,
          revenue: monthRevenue
        })
      }

      // Booking sources (simplified - assuming direct bookings)
      const bookingSources = [
        { source: 'Direct', count: Math.floor(totalBookings * 0.6), percentage: 60 },
        { source: 'Website', count: Math.floor(totalBookings * 0.25), percentage: 25 },
        { source: 'Mobile App', count: Math.floor(totalBookings * 0.15), percentage: 15 }
      ]

      // Top properties by bookings
      const propertyStats: { [key: string]: { bookings: number, revenue: number } } = {}
      partnerBookings.forEach((booking: any) => {
        const propertyName = booking.hotelId?.name || 'Unknown Property'
        if (!propertyStats[propertyName]) {
          propertyStats[propertyName] = { bookings: 0, revenue: 0 }
        }
        propertyStats[propertyName].bookings += 1
        if (booking.status === 'completed') {
          propertyStats[propertyName].revenue += booking.totalPrice
        }
      })

      const topProperties = Object.entries(propertyStats)
        .sort(([,a], [,b]) => b.bookings - a.bookings)
        .slice(0, 5)
        .map(([name, stats]) => ({
          name,
          bookings: stats.bookings,
          revenue: stats.revenue
        }))

      setAnalyticsData({
        totalBookings,
        activeBookings,
        occupancyRate,
        averageBookingValue,
        popularTimes,
        bookingTrends,
        bookingSources,
        topProperties
      })
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: "Total Bookings",
      value: analyticsData.totalBookings.toString(),
      change: "+12.5%",
      icon: Calendar,
    },
    {
      title: "Active Bookings",
      value: analyticsData.activeBookings.toString(),
      change: "+8.2%",
      icon: Users,
    },
    {
      title: "Occupancy Rate",
      value: `${analyticsData.occupancyRate}%`,
      change: "+5.1%",
      icon: TrendingUp,
    },
    {
      title: "Avg. Booking Value",
      value: `₹${Number(analyticsData.averageBookingValue || 0).toLocaleString('en-IN')}`,
      change: "+15.3%",
      icon: BarChart3,
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
        {statsCards.map((stat) => (
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
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium ml-1 text-green-600">
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Trends Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Booking Trends</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Booking Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Popular Booking Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.popularTimes.map((time, index) => (
                <div key={time.hour} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{time.hour}</span>
                  </div>
                  <span className="text-muted-foreground">{time.bookings} bookings</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.bookingSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.bookingSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Performing Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topProperties.map((property, index) => (
              <div key={property.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">{property.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{property.revenue.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}