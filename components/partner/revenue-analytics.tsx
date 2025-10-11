"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface RevenueData {
  totalRevenue: number
  monthlyRevenue: number
  pendingPayouts: number
  completedBookings: number
  monthlyData: Array<{
    month: string
    revenue: number
    bookings: number
  }>
  recentTransactions: Array<{
    _id: string
    bookingId: string
    amount: number
    status: string
    date: string
    guestName: string
  }>
}

export function PartnerRevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayouts: 0,
    completedBookings: 0,
    monthlyData: [],
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchRevenueData()
    }
  }, [user])

  const fetchRevenueData = async () => {
    try {
      // Fetch partner hotels
      const hotelsResponse = await fetch(`/api/hotels?ownerId=${user?.uid}`)
      const hotelsData = await hotelsResponse.json()
      const hotels = hotelsData.hotels || []

      // Fetch bookings for partner's hotels directly
      const bookingsResponse = await fetch(`/api/bookings?ownerId=${user?.uid}`)
      const bookingsData = await bookingsResponse.json()
      const partnerBookings = bookingsData.bookings || []

      // Calculate revenue data
      const completedBookings = partnerBookings.filter((b: any) => b.status === 'completed')
      const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0)

      // Calculate monthly data (last 6 months)
      const monthlyData = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthBookings = completedBookings.filter((b: any) => {
          const bookingDate = new Date(b.createdAt)
          return bookingDate.getMonth() === date.getMonth() &&
                 bookingDate.getFullYear() === date.getFullYear()
        })
        const monthRevenue = monthBookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0)

        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          bookings: monthBookings.length
        })
      }

      // Recent transactions (last 10)
      const recentTransactions = completedBookings
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
        .map((booking: any) => ({
          _id: booking._id,
          bookingId: booking._id,
          amount: booking.totalPrice,
          status: booking.status,
          date: new Date(booking.updatedAt).toLocaleDateString(),
          guestName: booking.guestDetails?.name || 'Unknown Guest'
        }))

      // Calculate pending payouts (assuming 30% platform fee)
      const pendingPayouts = totalRevenue * 0.7

      setRevenueData({
        totalRevenue,
        monthlyRevenue: monthlyData[5]?.revenue || 0,
        pendingPayouts,
        completedBookings: completedBookings.length,
        monthlyData,
        recentTransactions
      })
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: `₹${revenueData.totalRevenue.toLocaleString('en-IN')}`,
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "This Month",
      value: `₹${revenueData.monthlyRevenue.toLocaleString('en-IN')}`,
      change: "+8.2%",
      trend: "up" as const,
      icon: Calendar,
    },
    {
      title: "Pending Payouts",
      value: `₹${revenueData.pendingPayouts.toLocaleString('en-IN')}`,
      change: "Available",
      trend: "up" as const,
      icon: TrendingUp,
    },
    {
      title: "Completed Bookings",
      value: revenueData.completedBookings.toString(),
      change: "+15.3%",
      trend: "up" as const,
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
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ml-1 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Trends</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number), 'Revenue']} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {revenueData.recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions found.</p>
          ) : (
            <div className="space-y-4">
              {revenueData.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{transaction.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          Booking #{transaction.bookingId.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">₹{transaction.amount.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}