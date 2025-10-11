"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, CreditCard, Building2, Save, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface PartnerSettings {
  profile: {
    displayName: string
    email: string
    phoneNumber: string
    businessName: string
    businessAddress: string
    taxId: string
  }
  notifications: {
    emailBookings: boolean
    emailReviews: boolean
    emailMessages: boolean
    emailMarketing: boolean
    pushBookings: boolean
    pushReviews: boolean
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
  }
  payment: {
    payoutMethod: 'bank' | 'paypal' | 'stripe'
    payoutSchedule: 'weekly' | 'monthly' | 'manual'
    bankDetails?: {
      accountNumber: string
      routingNumber: string
      accountName: string
    }
  }
}

export function PartnerSettings() {
  const { user, mongoUser } = useAuth()
  const [settings, setSettings] = useState<PartnerSettings>({
    profile: {
      displayName: '',
      email: '',
      phoneNumber: '',
      businessName: '',
      businessAddress: '',
      taxId: ''
    },
    notifications: {
      emailBookings: true,
      emailReviews: true,
      emailMessages: true,
      emailMarketing: false,
      pushBookings: true,
      pushReviews: true
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30
    },
    payment: {
      payoutMethod: 'bank',
      payoutSchedule: 'monthly'
    }
  })
  const [loading, setLoading] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/partner-settings?userId=${user?.uid}`)
      const data = await response.json()
      if (data.settings) {
        setSettings(prev => ({
          ...prev,
          ...data.settings,
          profile: {
            ...prev.profile,
            ...data.settings.profile
          },
          notifications: {
            ...prev.notifications,
            ...data.settings.notifications
          },
          security: {
            ...prev.security,
            ...data.settings.security
          },
          payment: {
            ...prev.payment,
            ...data.settings.payment
          }
        }))
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleSave = async (section: keyof PartnerSettings) => {
    setLoading(true)
    try {
      const response = await fetch('/api/partner-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          [section]: settings[section]
        })
      })

      if (response.ok) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast.error(`Failed to save ${section} settings`)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }))
  }

  const updateNotifications = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const updateSecurity = (field: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }))
  }

  const updatePayment = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.profile.displayName}
                    onChange={(e) => updateProfile('displayName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateProfile('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={settings.profile.phoneNumber}
                    onChange={(e) => updateProfile('phoneNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={settings.profile.businessName}
                    onChange={(e) => updateProfile('businessName', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  value={settings.profile.businessAddress}
                  onChange={(e) => updateProfile('businessAddress', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID / Business License</Label>
                <Input
                  id="taxId"
                  value={settings.profile.taxId}
                  onChange={(e) => updateProfile('taxId', e.target.value)}
                />
              </div>
              <Button onClick={() => handleSave('profile')} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailBookings">New Bookings</Label>
                      <p className="text-sm text-muted-foreground">Get notified when guests make new bookings</p>
                    </div>
                    <Switch
                      id="emailBookings"
                      checked={settings.notifications.emailBookings}
                      onCheckedChange={(checked) => updateNotifications('emailBookings', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailReviews">New Reviews</Label>
                      <p className="text-sm text-muted-foreground">Get notified when guests leave reviews</p>
                    </div>
                    <Switch
                      id="emailReviews"
                      checked={settings.notifications.emailReviews}
                      onCheckedChange={(checked) => updateNotifications('emailReviews', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailMessages">Messages</Label>
                      <p className="text-sm text-muted-foreground">Get notified about guest messages and inquiries</p>
                    </div>
                    <Switch
                      id="emailMessages"
                      checked={settings.notifications.emailMessages}
                      onCheckedChange={(checked) => updateNotifications('emailMessages', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailMarketing">Marketing Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive tips and platform updates</p>
                    </div>
                    <Switch
                      id="emailMarketing"
                      checked={settings.notifications.emailMarketing}
                      onCheckedChange={(checked) => updateNotifications('emailMarketing', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushBookings">Booking Alerts</Label>
                      <p className="text-sm text-muted-foreground">Instant notifications for new bookings</p>
                    </div>
                    <Switch
                      id="pushBookings"
                      checked={settings.notifications.pushBookings}
                      onCheckedChange={(checked) => updateNotifications('pushBookings', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushReviews">Review Alerts</Label>
                      <p className="text-sm text-muted-foreground">Instant notifications for new reviews</p>
                    </div>
                    <Switch
                      id="pushReviews"
                      checked={settings.notifications.pushReviews}
                      onCheckedChange={(checked) => updateNotifications('pushReviews', checked)}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('notifications')} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => updateSecurity('twoFactorEnabled', checked)}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <p className="text-sm text-muted-foreground mb-2">Automatically log out after period of inactivity</p>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value))}
                  min="5"
                  max="480"
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Password</h4>
                <p className="text-sm text-muted-foreground mb-4">Last changed 30 days ago</p>
                <Button variant="outline">Change Password</Button>
              </div>

              <Button onClick={() => handleSave('security')} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment & Payout Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="payoutMethod">Payout Method</Label>
                <p className="text-sm text-muted-foreground mb-2">Choose how you want to receive payments</p>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={settings.payment.payoutMethod === 'bank' ? 'default' : 'outline'}
                    onClick={() => updatePayment('payoutMethod', 'bank')}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Building2 className="h-6 w-6" />
                    Bank Transfer
                  </Button>
                  <Button
                    variant={settings.payment.payoutMethod === 'paypal' ? 'default' : 'outline'}
                    onClick={() => updatePayment('payoutMethod', 'paypal')}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <CreditCard className="h-6 w-6" />
                    PayPal
                  </Button>
                  <Button
                    variant={settings.payment.payoutMethod === 'stripe' ? 'default' : 'outline'}
                    onClick={() => updatePayment('payoutMethod', 'stripe')}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <CreditCard className="h-6 w-6" />
                    Stripe
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                <p className="text-sm text-muted-foreground mb-2">How often you want to receive payouts</p>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={settings.payment.payoutSchedule === 'weekly' ? 'default' : 'outline'}
                    onClick={() => updatePayment('payoutSchedule', 'weekly')}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={settings.payment.payoutSchedule === 'monthly' ? 'default' : 'outline'}
                    onClick={() => updatePayment('payoutSchedule', 'monthly')}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={settings.payment.payoutSchedule === 'manual' ? 'default' : 'outline'}
                    onClick={() => updatePayment('payoutSchedule', 'manual')}
                  >
                    Manual
                  </Button>
                </div>
              </div>

              {settings.payment.payoutMethod === 'bank' && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Bank Account Details</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBankDetails(!showBankDetails)}
                    >
                      {showBankDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="accountName">Account Holder Name</Label>
                      <Input
                        id="accountName"
                        type={showBankDetails ? "text" : "password"}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        type={showBankDetails ? "text" : "password"}
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        type={showBankDetails ? "text" : "password"}
                        placeholder="123456789"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Info</Badge>
                  <div>
                    <p className="font-medium">Payout Information</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Payouts are processed within 3-5 business days after booking completion.
                      A 3% platform fee applies to all transactions.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('payment')} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}