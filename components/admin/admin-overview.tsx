"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Settings,
} from "lucide-react"

interface SystemStats {
  totalUsers: number
  activeProperties: number
  platformRevenue: number
  systemHealth: number
}

interface RecentActivity {
  _id: string
  type: 'user_registered' | 'property_added' | 'booking_created' | 'system_alert'
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
}

export function AdminOverview() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeProperties: 0,
    platformRevenue: 0,
    systemHealth: 99.8
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAdminData = useCallback(async () => {
    try {
      // Fetch all data in parallel with pagination
      const [hotelsResponse, bookingsResponse, usersResponse] = await Promise.all([
        fetch('/api/hotels?includeInactive=true&limit=100').catch(() => ({ ok: false, json: async () => ({ hotels: [] }) })),
        fetch('/api/bookings?limit=100').catch(() => ({ ok: false, json: async () => ({ bookings: [] }) })),
        fetch('/api/users?limit=100').catch(() => ({ ok: false, json: async () => ({ users: [] }) }))
      ])

      // Check if any of the responses failed
      if (!hotelsResponse.ok || !bookingsResponse.ok || !usersResponse.ok) {
        console.error('One or more API requests failed')
      }

      const hotelsData = await hotelsResponse.json()
      const bookingsData = await bookingsResponse.json()
      const usersData = await usersResponse.json()

      // Handle paginated response structures
      const hotels = hotelsData?.hotels || []
      const bookings = bookingsData?.bookings || []
      const users = usersData?.users || []

      // Calculate stats with safe fallbacks
      const activeProperties = hotels.filter((h: any) => h && h.isActive).length
      const platformRevenue = bookings
        .filter((b: any) => b && b.status === 'completed')
        .reduce((sum: number, b: any) => sum + ((b.totalPrice || 0) * 0.1), 0) // 10% platform fee
      const totalUsers = users?.length || 0

      setStats({
        totalUsers,
        activeProperties,
        platformRevenue,
        systemHealth: 99.8
      })

      // Generate recent activities from bookings and hotels with error handling
      const activities: RecentActivity[] = [
        ...bookings.slice(0, 3).filter(Boolean).map((booking: any) => ({
          _id: booking._id || `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'booking_created' as const,
          description: `New booking for ${booking.hotelId?.name || booking.hotelName || 'Unknown Hotel'}`,
          timestamp: booking.createdAt || new Date().toISOString(),
          status: 'success' as const
        })),
        ...hotels.slice(0, 2).filter(Boolean).map((hotel: any) => ({
          _id: hotel._id || `hotel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'property_added' as const,
          description: `New property "${hotel.name || 'Unknown'}" added`,
          timestamp: hotel.createdAt || new Date().toISOString(),
          status: 'info' as const
        }))
      ].sort((a, b) => {
        try {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        } catch (e) {
          return 0
        }
      })

      setRecentActivities(activities.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      // Set some default data to prevent UI errors
      setStats({
        totalUsers: 0,
        activeProperties: 0,
        platformRevenue: 0,
        systemHealth: 0
      })
      setRecentActivities([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  const systemStatsData = useMemo(() => [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+8.2%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Properties",
      value: stats.activeProperties.toLocaleString(),
      change: "+12.5%",
      icon: Building2,
      color: "text-green-600",
    },
    {
      title: "Platform Revenue",
      value: `₹${(stats.platformRevenue / 1000).toFixed(1)}K`,
      change: "+15.3%",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "System Health",
      value: `${stats.systemHealth}%`,
      change: "+0.1%",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
  ], [stats])

  const getActivityIcon = useCallback((type: string, status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

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
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStatsData.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last month
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activities.</p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3">
                    {getActivityIcon(activity.type, activity.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Building2 className="h-6 w-6 mb-2" />
                <span className="text-sm">Properties</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="text-sm">Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Settings className="h-6 w-6 mb-2" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
