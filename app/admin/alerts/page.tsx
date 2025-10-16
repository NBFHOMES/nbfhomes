"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Bell, CheckCircle, XCircle, Clock, Server, Database, Users, DollarSign, Mail } from "lucide-react"
import { toast } from "sonner"

interface SystemAlert {
  id: string
  type: 'system' | 'security' | 'performance' | 'business' | 'user'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  source: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
  metadata?: Record<string, any>
}

const severityColors = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const typeIcons = {
  system: Server,
  security: AlertTriangle,
  performance: Clock,
  business: DollarSign,
  user: Users,
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<SystemAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchAlerts()
  }, [])

  useEffect(() => {
    filterAlerts()
  }, [alerts, filterType, filterSeverity, filterStatus])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const filterAlerts = () => {
    let filtered = alerts

    if (filterType !== "all") {
      filtered = filtered.filter(alert => alert.type === filterType)
    }

    if (filterSeverity !== "all") {
      filtered = filtered.filter(alert => alert.severity === filterSeverity)
    }

    if (filterStatus !== "all") {
      if (filterStatus === "unacknowledged") {
        filtered = filtered.filter(alert => !alert.acknowledged)
      } else if (filterStatus === "unresolved") {
        filtered = filtered.filter(alert => !alert.resolved)
      } else if (filterStatus === "critical") {
        filtered = filtered.filter(alert => alert.severity === 'critical')
      }
    }

    setFilteredAlerts(filtered)
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ))
      toast.success('Alert acknowledged')
    } catch (error) {
      toast.error('Failed to acknowledge alert')
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ))
      toast.success('Alert resolved')
    } catch (error) {
      toast.error('Failed to resolve alert')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAlertStats = () => {
    return {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      unresolved: alerts.filter(a => !a.resolved).length,
      critical: alerts.filter(a => a.severity === 'critical').length,
    }
  }

  const stats = getAlertStats()

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
          System <span className="text-gradient">Alerts</span>
        </h1>
        <p className="text-muted-foreground">Monitor system alerts and notifications</p>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unacknowledged</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unacknowledged}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unresolved</p>
                <p className="text-2xl font-bold text-red-600">{stats.unresolved}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="critical">Critical Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const TypeIcon = typeIcons[alert.type]
              return (
                <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <TypeIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={severityColors[alert.severity]}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {alert.source}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!alert.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {!alert.resolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(alert.timestamp)}</span>
                      <div className="flex gap-2">
                        {alert.acknowledged && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledged
                          </Badge>
                        )}
                        {alert.resolved && (
                          <Badge variant="outline" className="text-blue-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredAlerts.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No alerts found matching your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}