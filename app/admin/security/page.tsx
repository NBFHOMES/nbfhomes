"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, Lock, Unlock, Eye, UserX, Activity, Server, Wifi, Database } from "lucide-react"
import { toast } from "sonner"

interface SecurityData {
  activeSessions: Array<{
    id: string
    userId: string
    userName: string
    userEmail: string
    ipAddress: string
    userAgent: string
    lastActivity: string
    status: 'active' | 'suspended'
  }>
  securityAlerts: Array<{
    id: string
    type: 'failed_login' | 'suspicious_activity' | 'unauthorized_access' | 'password_change'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    userId?: string
    ipAddress?: string
    timestamp: string
    resolved: boolean
  }>
  systemHealth: {
    firewallStatus: 'active' | 'inactive'
    encryptionStatus: 'enabled' | 'disabled'
    backupStatus: 'healthy' | 'warning' | 'critical'
    sslCertificate: 'valid' | 'expiring' | 'expired'
    serverLoad: number
    databaseConnections: number
  }
  accessLogs: Array<{
    id: string
    userId: string
    action: string
    resource: string
    ipAddress: string
    timestamp: string
    success: boolean
  }>
}

const severityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function AdminSecurityPage() {
  const { user } = useAuth()
  const [securityData, setSecurityData] = useState<SecurityData>({
    activeSessions: [],
    securityAlerts: [],
    systemHealth: {
      firewallStatus: 'active',
      encryptionStatus: 'enabled',
      backupStatus: 'healthy',
      sslCertificate: 'valid',
      serverLoad: 45,
      databaseConnections: 23
    },
    accessLogs: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      const response = await fetch('/api/security')
      if (!response.ok) {
        throw new Error('Failed to fetch security data')
      }
      const data = await response.json()

      setSecurityData({
        activeSessions: data.activeSessions || [],
        securityAlerts: data.securityAlerts || [],
        systemHealth: data.systemHealth || {
          firewallStatus: 'active',
          encryptionStatus: 'enabled',
          backupStatus: 'healthy',
          sslCertificate: 'valid',
          serverLoad: 45,
          databaseConnections: 23
        },
        accessLogs: Array.isArray(data.accessLogs) ? data.accessLogs : []
      })
    } catch (error) {
      console.error('Failed to fetch security data:', error)
      toast.error('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      // Create a logout security event to terminate the session
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'logout',
          severity: 'low',
          userId: sessionId,
          userEmail: user?.email,
          description: 'Session terminated by admin',
          metadata: { terminatedBy: user?.uid }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to terminate session')
      }

      // Refresh the data to show updated sessions
      await fetchSecurityData()
      toast.success('Session terminated successfully')
    } catch (error) {
      console.error('Failed to terminate session:', error)
      toast.error('Failed to terminate session')
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/security/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolved: true,
          resolvedBy: user?.uid
        })
      })

      if (!response.ok) {
        throw new Error('Failed to resolve alert')
      }

      // Refresh the data to show updated alerts
      await fetchSecurityData()
      toast.success('Alert resolved successfully')
    } catch (error) {
      console.error('Failed to resolve alert:', error)
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
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
              Security <span className="text-gradient">Management</span>
            </h1>
            <p className="text-muted-foreground">Monitor security threats and manage access controls</p>
          </div>

          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Firewall</p>
                    <p className="text-2xl font-bold flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-green-600" />
                      Active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Encryption</p>
                    <p className="text-2xl font-bold flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-green-600" />
                      Enabled
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Server Load</p>
                    <p className="text-2xl font-bold">{securityData.systemHealth.serverLoad}%</p>
                    <p className="text-xs text-muted-foreground">Normal range</p>
                  </div>
                  <Server className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SSL Certificate</p>
                    <p className="text-2xl font-bold flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-green-600" />
                      Valid
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Sessions ({securityData.activeSessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityData.activeSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{session.userName}</p>
                        <p className="text-sm text-muted-foreground">{session.ipAddress} • {session.userAgent}</p>
                        <p className="text-xs text-muted-foreground">Last active: {formatDate(session.lastActivity)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Terminate
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Alerts ({securityData.securityAlerts.filter(a => !a.resolved).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityData.securityAlerts.filter(alert => !alert.resolved).map((alert) => (
                    <div key={alert.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(alert.severity)}
                          <Badge className={severityColors[alert.severity]}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                      <p className="text-sm mb-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.ipAddress && `IP: ${alert.ipAddress} • `}
                        {formatDate(alert.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Access Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Access Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityData.accessLogs?.slice(0, 10)?.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{log.action}</span> on {log.resource} by User {log.userId ? log.userId.slice(-4) : 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.ipAddress} • {formatDate(log.timestamp)}
                      </p>
                    </div>
                    <Badge variant={log.success ? "default" : "destructive"}>
                      {log.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
    </>
  )
}