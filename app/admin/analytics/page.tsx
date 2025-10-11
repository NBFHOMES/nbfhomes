"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Users, Building2, Calendar, TrendingUp, Eye, MapPin, Star } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { toast } from "sonner"

interface AnalyticsData {
  userGrowth: Array<{ month: string, users: number, activeUsers: number }>
  bookingTrends: Array<{ month: string, bookings: number, revenue: number }>
  topDestinations: Array<{ city: string, country: string, bookings: number, revenue: number }>
  userDemographics: Array<{ role: string, count: number, percentage: number }>
  platformHealth: {
    totalUsers: number
    activeUsers: number
    totalHotels: number
    activeHotels: number
    totalBookings: number
    completedBookings: number
    averageRating: number
    systemUptime: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    bookingTrends: [],
    topDestinations: [],
    userDemographics: [],
    platformHealth: {
      totalUsers: 0,
      activeUsers: 0,
      totalHotels: 0,
      activeHotels: 0,
      totalBookings: 0,
      completedBookings: 0,
      averageRating: 0,
      systemUptime: 99.9
    }
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch all data in parallel
      const [usersResponse, hotelsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/hotels?includeInactive=true'),
        fetch('/api/bookings')
      ])

      const usersData = await usersResponse.json() as { users: any[] }
      const hotelsData = await hotelsResponse.json() as { hotels: any[] }
      const bookingsData = await bookingsResponse.json() as { bookings: any[] }

      const users = usersData.users || []
      const hotels = hotelsData.hotels || []
      const bookings = bookingsData.bookings || []

      // Calculate user growth over time
      const userGrowth = calculateUserGrowth(users)

      // Calculate booking trends
      const bookingTrends = calculateBookingTrends(bookings)

      // Top destinations
      const topDestinations = calculateTopDestinations(bookings, hotels)

      // User demographics
      const userDemographics = calculateUserDemographics(users)

      // Platform health metrics
      const platformHealth = {
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        totalHotels: hotels.length,
        activeHotels: hotels.filter((h: any) => h.isActive).length,
        totalBookings: bookings.length,
        completedBookings: bookings.filter((b: any) => b.status === 'completed').length,
        averageRating: calculateAverageRating(hotels),
        systemUptime: 99.9
      }

      setAnalyticsData({
        userGrowth,
        bookingTrends,
        topDestinations,
        userDemographics,
        platformHealth
      })
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const calculateUserGrowth = (users: any[]) => {
    const months = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      const monthUsers = users.filter(u => {
        const userDate = new Date(u.createdAt)
        return userDate.getMonth() === date.getMonth() &&
               userDate.getFullYear() === date.getFullYear()
      }).length

      const activeUsers = users.filter(u => {
        const userDate = new Date(u.createdAt)
        return userDate.getMonth() === date.getMonth() &&
               userDate.getFullYear() === date.getFullYear() &&
               u.status === 'active'
      }).length

      months.push({
        month: monthName,
        users: monthUsers,
        activeUsers
      })
    }

    return months
  }

  const calculateBookingTrends = (bookings: any[]) => {
    const months = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt)
        return bookingDate.getMonth() === date.getMonth() &&
               bookingDate.getFullYear() === date.getFullYear()
      })

      const bookingsCount = monthBookings.length
      const revenue = monthBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.totalPrice, 0)

      months.push({
        month: monthName,
        bookings: bookingsCount,
        revenue: Math.round(revenue)
      })
    }

    return months
  }

  const calculateTopDestinations = (bookings: any[], hotels: any[]): Array<{ city: string, country: string, bookings: number, revenue: number }> => {
    const destinationStats = bookings
      .filter(b => b.status === 'completed')
      .reduce((acc, booking) => {
        const hotel = hotels.find(h => h._id === booking.hotelId?._id || booking.hotelId)
        if (hotel) {
          const key = `${hotel.location.city}-${hotel.location.country}`
          if (!acc[key]) {
            acc[key] = {
              city: hotel.location.city,
              country: hotel.location.country,
              bookings: 0,
              revenue: 0
            }
          }
          acc[key].bookings += 1
          acc[key].revenue += booking.totalPrice
        }
        return acc
      }, {} as Record<string, { city: string, country: string, bookings: number, revenue: number }>)

    const destinations = Object.values(destinationStats) as Array<{ city: string, country: string, bookings: number, revenue: number }>
    return destinations
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)
      .map(dest => ({
        ...dest,
        revenue: Math.round(dest.revenue)
      }))
  }

  const calculateUserDemographics = (users: any[]) => {
    const demographics = users.reduce((acc, user) => {
      const role = user.role
      if (!acc[role]) {
        acc[role] = 0
      }
      acc[role] += 1
      return acc
    }, {} as Record<string, number>)

    const total = users.length
    return Object.entries(demographics).map(([role, count]) => ({
      role: role.charAt(0).toUpperCase() + role.slice(1),
      count: count as number,
      percentage: Math.round((count as number / total) * 100)
    }))
  }

  const calculateAverageRating = (hotels: any[]) => {
    const ratedHotels = hotels.filter(h => h.rating > 0)
    if (ratedHotels.length === 0) return 0

    const totalRating = ratedHotels.reduce((sum, hotel) => sum + hotel.rating, 0)
    return Math.round((totalRating / ratedHotels.length) * 10) / 10
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Platform <span className="text-gradient">Analytics</span>
        </h1>
        <p className="text-muted-foreground">Comprehensive analytics and business intelligence</p>
      </div>
      <div className="flex justify-end mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{analyticsData.platformHealth.totalUsers}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{Math.round((analyticsData.platformHealth.activeUsers / analyticsData.platformHealth.totalUsers) * 100)}%
                  </span>
                  active
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Hotels</p>
                <p className="text-2xl font-bold">{analyticsData.platformHealth.activeHotels}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{Math.round((analyticsData.platformHealth.activeHotels / analyticsData.platformHealth.totalHotels) * 100)}%
                  </span>
                  of total
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{analyticsData.platformHealth.totalBookings}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{Math.round((analyticsData.platformHealth.completedBookings / analyticsData.platformHealth.totalBookings) * 100)}%
                  </span>
                  completed
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold flex items-center">
                  <Star className="w-5 h-5 mr-1 fill-yellow-400 text-yellow-400" />
                  {analyticsData.platformHealth.averageRating}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-yellow-600">★★★★☆</span>
                  overall
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Total Users"
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topDestinations.map((destination, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{destination.city}, {destination.country}</p>
                      <p className="text-sm text-muted-foreground">{destination.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{destination.revenue.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.userDemographics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percentage }) => `${role} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.userDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}