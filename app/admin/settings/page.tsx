"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Save, Mail, Shield, Database, Globe, Bell, CreditCard, Users } from "lucide-react"
import { toast } from "sonner"

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportPhone: string
    timezone: string
    language: string
  }
  security: {
    enableTwoFactor: boolean
    passwordMinLength: number
    sessionTimeout: number
    maxLoginAttempts: number
    enableCaptcha: boolean
    ipWhitelist: string[]
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    fromEmail: string
    fromName: string
  }
  payments: {
    stripePublishableKey: string
    stripeSecretKey: string
    paypalClientId: string
    paypalClientSecret: string
    platformFee: number
    currency: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    bookingConfirmations: boolean
    paymentReminders: boolean
    systemAlerts: boolean
  }
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)


  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        // Use default settings if none exist
        setSettings({
          general: {
            siteName: "StayHub",
            siteDescription: "Modern hotel booking platform",
            contactEmail: "support@stayhub.com",
            supportPhone: "+1 (555) 123-4567",
            timezone: "UTC",
            language: "en"
          },
          security: {
            enableTwoFactor: true,
            passwordMinLength: 8,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            enableCaptcha: true,
            ipWhitelist: []
          },
          email: {
            smtpHost: "smtp.gmail.com",
            smtpPort: 587,
            smtpUser: "",
            smtpPassword: "",
            fromEmail: "noreply@stayhub.com",
            fromName: "StayHub"
          },
          payments: {
            stripePublishableKey: "",
            stripeSecretKey: "",
            paypalClientId: "",
            paypalClientSecret: "",
            platformFee: 10,
            currency: "USD"
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            bookingConfirmations: true,
            paymentReminders: true,
            systemAlerts: true
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (section?: string) => {
    if (!settings || !user) return

    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          updatedBy: user.uid
        })
      })

      if (response.ok) {
        const message = section
          ? `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`
          : 'Settings saved successfully'
        toast.success(message)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const updateSetting = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => prev ? ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }) : null)
  }

  return (
    <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              System <span className="text-gradient">Settings</span>
            </h1>
            <p className="text-muted-foreground">Configure platform settings and preferences</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.general.siteName}
                        onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportPhone">Support Phone</Label>
                      <Input
                        id="supportPhone"
                        value={settings.general.supportPhone}
                        onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={settings.general.timezone}
                        onValueChange={(value) => updateSetting('general', 'timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time</SelectItem>
                          <SelectItem value="PST">Pacific Time</SelectItem>
                          <SelectItem value="GMT">GMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={() => saveSettings('general')}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                      </div>
                      <Switch
                        checked={settings.security.enableTwoFactor}
                        onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable CAPTCHA</Label>
                        <p className="text-sm text-muted-foreground">Show CAPTCHA on login forms</p>
                      </div>
                      <Switch
                        checked={settings.security.enableCaptcha}
                        onCheckedChange={(checked) => updateSetting('security', 'enableCaptcha', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => saveSettings('security')}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.email.smtpHost}
                        onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={settings.email.smtpUser}
                        onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={settings.email.fromName}
                        onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => saveSettings('email')}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="platformFee">Platform Fee (%)</Label>
                      <Input
                        id="platformFee"
                        type="number"
                        value={settings.payments.platformFee}
                        onChange={(e) => updateSetting('payments', 'platformFee', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={settings.payments.currency}
                        onValueChange={(value) => updateSetting('payments', 'currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Stripe Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
                        <Input
                          id="stripePublishableKey"
                          type="password"
                          value={settings.payments.stripePublishableKey}
                          onChange={(e) => updateSetting('payments', 'stripePublishableKey', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                        <Input
                          id="stripeSecretKey"
                          type="password"
                          value={settings.payments.stripeSecretKey}
                          onChange={(e) => updateSetting('payments', 'stripeSecretKey', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">PayPal Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                        <Input
                          id="paypalClientId"
                          value={settings.payments.paypalClientId}
                          onChange={(e) => updateSetting('payments', 'paypalClientId', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paypalClientSecret">PayPal Client Secret</Label>
                        <Input
                          id="paypalClientSecret"
                          type="password"
                          value={settings.payments.paypalClientSecret}
                          onChange={(e) => updateSetting('payments', 'paypalClientSecret', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => saveSettings('payments')}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Payment Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                      </div>
                      <Switch
                        checked={settings.notifications.smsNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send push notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Booking Confirmations</Label>
                        <p className="text-sm text-muted-foreground">Send booking confirmation emails</p>
                      </div>
                      <Switch
                        checked={settings.notifications.bookingConfirmations}
                        onCheckedChange={(checked) => updateSetting('notifications', 'bookingConfirmations', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Payment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Send payment reminder notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.paymentReminders}
                        onCheckedChange={(checked) => updateSetting('notifications', 'paymentReminders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Send system alert notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.systemAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => saveSettings('notifications')}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    </>
  )
}