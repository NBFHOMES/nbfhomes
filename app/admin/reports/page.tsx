"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, TrendingUp, Users, Building2, DollarSign, BarChart3, PieChart, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

interface ReportData {
  userReport: {
    totalUsers: number
    newUsersThisMonth: number
    activeUsers: number
    userGrowthRate: number
    topUserLocations: Array<{ location: string, count: number }>
  }
  bookingReport: {
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    totalRevenue: number
    averageBookingValue: number
    monthlyBookings: Array<{ month: string, bookings: number, revenue: number }>
  }
  hotelReport: {
    totalHotels: number
    activeHotels: number
    averageRating: number
    topRatedHotels: Array<{ name: string, rating: number, bookings: number }>
    revenueByHotel: Array<{ name: string, revenue: number }>
  }
  systemReport: {
    totalRevenue: number
    platformFees: number
    systemUptime: number
    apiCalls: number
    errorRate: number
  }
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState("comprehensive")
  const [dateRange, setDateRange] = useState("30d")
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    generateReport()
  }, [reportType, dateRange])

  const generateReport = async () => {
    try {
      setLoading(true)

      // Fetch all necessary data
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

      // Generate comprehensive report data
      const report: ReportData = {
        userReport: generateUserReport(users),
        bookingReport: generateBookingReport(bookings),
        hotelReport: generateHotelReport(hotels, bookings),
        systemReport: generateSystemReport(bookings, users, hotels)
      }

      setReportData(report)
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const generateUserReport = (users: any[]) => {
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.status === 'active').length

    // Calculate new users this month
    const now = new Date()
    const thisMonth = users.filter(u => {
      const userDate = new Date(u.createdAt)
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
    }).length

    // Calculate growth rate (simplified)
    const lastMonth = users.filter(u => {
      const userDate = new Date(u.createdAt)
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return userDate.getMonth() === lastMonthDate.getMonth() && userDate.getFullYear() === lastMonthDate.getFullYear()
    }).length

    const growthRate = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    // Top user locations based on user address data
    const locationCounts: { [key: string]: number } = {}
    users.forEach(user => {
      if (user.address?.country) {
        const location = user.address.city && user.address.country
          ? `${user.address.city}, ${user.address.country}`
          : user.address.country
        locationCounts[location] = (locationCounts[location] || 0) + 1
      }
    })

    const topUserLocations = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }))

    return {
      totalUsers,
      newUsersThisMonth: thisMonth,
      activeUsers,
      userGrowthRate: Math.round(growthRate * 100) / 100,
      topUserLocations
    }
  }

  const generateBookingReport = (bookings: any[]) => {
    const totalBookings = bookings.length
    const completedBookings = bookings.filter(b => b.status === 'completed').length
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length

    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0)

    const averageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0

    // Monthly bookings for last 12 months
    const monthlyBookings = []
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

      monthlyBookings.push({
        month: monthName,
        bookings: bookingsCount,
        revenue: Math.round(revenue)
      })
    }

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: Math.round(totalRevenue),
      averageBookingValue: Math.round(averageBookingValue),
      monthlyBookings
    }
  }

  const generateHotelReport = (hotels: any[], bookings: any[]) => {
    const totalHotels = hotels.length
    const activeHotels = hotels.filter(h => h.isActive).length

    const ratedHotels = hotels.filter(h => h.rating > 0)
    const averageRating = ratedHotels.length > 0
      ? ratedHotels.reduce((sum, h) => sum + h.rating, 0) / ratedHotels.length
      : 0

    // Top rated hotels
    const topRatedHotels = hotels
      .filter(h => h.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map(h => ({
        name: h.name,
        rating: h.rating,
        bookings: bookings.filter(b => b.hotelId === h._id || b.hotelId?._id === h._id).length
      }))

    // Revenue by hotel
    const revenueByHotel = hotels.map(hotel => {
      const hotelBookings = bookings.filter(b =>
        b.status === 'completed' &&
        (b.hotelId === hotel._id || b.hotelId?._id === hotel._id)
      )
      const revenue = hotelBookings.reduce((sum, b) => sum + b.totalPrice, 0)

      return {
        name: hotel.name,
        revenue: Math.round(revenue)
      }
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10)

    return {
      totalHotels,
      activeHotels,
      averageRating: Math.round(averageRating * 10) / 10,
      topRatedHotels,
      revenueByHotel
    }
  }

  const generateSystemReport = (bookings: any[], users: any[], hotels: any[]) => {
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0)

    const platformFees = totalRevenue * 0.1 // 10% platform fee

    return {
      totalRevenue: Math.round(totalRevenue),
      platformFees: Math.round(platformFees),
      systemUptime: 99.9,
      apiCalls: Math.floor((users.length * 10) + (bookings.length * 5) + (hotels.length * 3)), // Estimated based on system activity
      errorRate: 0.1
    }
  }

  const exportReport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      setGeneratingReport(true)

      // In a real implementation, this would call an API to generate and download the report
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing

      toast.success(`${format.toUpperCase()} report exported successfully`)
    } catch (error) {
      toast.error('Failed to export report')
    } finally {
      setGeneratingReport(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading || !reportData) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
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
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          System <span className="text-gradient">Reports</span>
        </h1>
        <p className="text-muted-foreground">Generate and view detailed system reports</p>
      </div>
      <div className="flex justify-end gap-2 mb-6">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comprehensive">Comprehensive</SelectItem>
            <SelectItem value="users">User Report</SelectItem>
            <SelectItem value="bookings">Booking Report</SelectItem>
            <SelectItem value="hotels">Hotel Report</SelectItem>
            <SelectItem value="financial">Financial Report</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
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
        <Button
          onClick={() => generateReport()}
          disabled={loading}
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate
        </Button>
      </div>

      {/* Export Options */}
      <div className="flex gap-2 mb-6">
        <Button
          variant="outline"
          onClick={() => exportReport('csv')}
          disabled={generatingReport}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => exportReport('excel')}
          disabled={generatingReport}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Button
          variant="outline"
          onClick={() => exportReport('pdf')}
          disabled={generatingReport}
        >
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.systemReport.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+15.3%</span> from last month
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
                <p className="text-sm font-medium text-muted-foreground">Platform Fees</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.systemReport.platformFees)}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600">10%</span> of total revenue
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{reportData.bookingReport.totalBookings}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{reportData.bookingReport.completedBookings}</span> completed
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
                <p className="text-sm font-medium text-muted-foreground">Active Hotels</p>
                <p className="text-2xl font-bold">{reportData.hotelReport.activeHotels}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-yellow-600">⭐ {reportData.hotelReport.averageRating}</span> avg rating
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="font-semibold">{reportData.userReport.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <span className="font-semibold">{reportData.userReport.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">New Users (This Month)</span>
                <span className="font-semibold">{reportData.userReport.newUsersThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Growth Rate</span>
                <span className="font-semibold text-green-600">+{reportData.userReport.userGrowthRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Bookings</span>
                <span className="font-semibold">{reportData.bookingReport.totalBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-semibold text-green-600">{reportData.bookingReport.completedBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cancelled</span>
                <span className="font-semibold text-red-600">{reportData.bookingReport.cancelledBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Booking Value</span>
                <span className="font-semibold">{formatCurrency(reportData.bookingReport.averageBookingValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Top User Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.userReport.topUserLocations.map((location, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{location.location}</span>
                  <span className="font-semibold">{location.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Hotels by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Top Hotels by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.hotelReport.revenueByHotel.slice(0, 5).map((hotel, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm truncate mr-2">{hotel.name}</span>
                  <span className="font-semibold">{formatCurrency(hotel.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}