"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, TrendingDown, Calendar, Users, Building2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { toast } from "sonner"

interface RevenueData {
  totalRevenue: number
  monthlyRevenue: Array<{ month: string, revenue: number }>
  revenueByStatus: Array<{ status: string, amount: number, count: number }>
  topHotels: Array<{ name: string, revenue: number, bookings: number }>
  recentTransactions: Array<{
    _id: string
    hotelName: string
    amount: number
    status: string
    date: string
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: [],
    revenueByStatus: [],
    topHotels: [],
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    fetchRevenueData()
  }, [timeRange])

  const fetchRevenueData = async () => {
    try {
      // Fetch bookings and hotels data
      const [bookingsResponse, hotelsResponse] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/hotels?includeInactive=true')
      ])

      const bookingsData = await bookingsResponse.json() as { bookings: any[] }
      const hotelsData = await hotelsResponse.json() as { hotels: any[] }

      const bookings = bookingsData.bookings || []
      const hotels = hotelsData.hotels || []

      // Calculate total revenue (10% platform fee)
      const totalRevenue = bookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.totalPrice * 0.1), 0)

      // Calculate monthly revenue for the last 12 months
      const monthlyRevenue = calculateMonthlyRevenue(bookings)

      // Revenue by booking status
      const revenueByStatus = calculateRevenueByStatus(bookings)

      // Top performing hotels
      const topHotels = calculateTopHotels(bookings, hotels)

      // Recent transactions
      const recentTransactions = bookings
        .filter((b: any) => b.status === 'completed')
        .slice(0, 10)
        .map((booking: any) => ({
          _id: booking._id,
          hotelName: booking.hotelId?.name || 'Unknown Hotel',
          amount: booking.totalPrice * 0.1,
          status: booking.status,
          date: booking.createdAt
        }))

      setRevenueData({
        totalRevenue,
        monthlyRevenue,
        revenueByStatus,
        topHotels,
        recentTransactions
      })
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
      toast.error('Failed to load revenue data')
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyRevenue = (bookings: any[]) => {
    const months = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      const monthRevenue = bookings
        .filter(b => {
          const bookingDate = new Date(b.createdAt)
          return bookingDate.getMonth() === date.getMonth() &&
                 bookingDate.getFullYear() === date.getFullYear() &&
                 b.status === 'completed'
        })
        .reduce((sum, b) => sum + (b.totalPrice * 0.1), 0)

      months.push({
        month: monthName,
        revenue: Math.round(monthRevenue)
      })
    }

    return months
  }

  const calculateRevenueByStatus = (bookings: any[]) => {
    const statusRevenue = bookings.reduce((acc, booking) => {
      const status = booking.status
      const revenue = booking.status === 'completed' ? booking.totalPrice * 0.1 : 0

      if (!acc[status]) {
        acc[status] = { amount: 0, count: 0 }
      }

      acc[status].amount += revenue
      acc[status].count += 1

      return acc
    }, {} as Record<string, { amount: number, count: number }>)

    return Object.entries(statusRevenue).map(([status, data]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      amount: Math.round((data as { amount: number, count: number }).amount),
      count: (data as { amount: number, count: number }).count
    }))
  }

  const calculateTopHotels = (bookings: any[], hotels: any[]) => {
    const hotelRevenue = bookings
      .filter((b: any) => b.status === 'completed')
      .reduce((acc, booking) => {
        const hotelId = booking.hotelId?._id || booking.hotelId
        const hotel = hotels.find((h: any) => h._id === hotelId)

        if (!acc[hotelId]) {
          acc[hotelId] = {
            name: hotel?.name || 'Unknown Hotel',
            revenue: 0,
            bookings: 0
          }
        }

        acc[hotelId].revenue += booking.totalPrice * 0.1
        acc[hotelId].bookings += 1

        return acc
      }, {} as Record<string, { name: string, revenue: number, bookings: number }>)

    return Object.values(hotelRevenue)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((hotel: any) => ({
        ...hotel,
        revenue: Math.round(hotel.revenue)
      }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
          Revenue <span className="text-gradient">Analytics</span>
        </h1>
        <p className="text-muted-foreground">Track platform revenue and financial performance</p>
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

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5%
                  </span>
                  from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Bookings</p>
                <p className="text-2xl font-bold">
                  {revenueData.revenueByStatus.find(s => s.status === 'Completed')?.count || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.2%
                  </span>
                  from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Commission</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    revenueData.revenueByStatus.find(s => s.status === 'Completed')?.count
                      ? Math.round(revenueData.totalRevenue / revenueData.revenueByStatus.find(s => s.status === 'Completed')!.count)
                      : 0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-purple-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5.1%
                  </span>
                  from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData.revenueByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {revenueData.revenueByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Hotels */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Hotels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.topHotels.map((hotel, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{hotel.name}</p>
                    <p className="text-sm text-muted-foreground">{hotel.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(hotel.revenue)}</p>
                    <p className="text-sm text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{transaction.hotelName}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{formatCurrency(transaction.amount)}</p>
                    <p className="text-sm text-muted-foreground">commission</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}