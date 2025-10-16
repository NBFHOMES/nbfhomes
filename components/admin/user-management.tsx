"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MoreHorizontal, Mail, Phone, MapPin, Shield, Ban, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface User {
  _id: string
  uid: string
  displayName: string
  email: string
  photoURL?: string
  role: 'guest' | 'partner' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  createdAt: string
  lastLogin?: string
  bookingsCount?: number
  propertiesCount?: number
  totalSpent?: number
  totalRevenue?: number
}

const roleColors = {
  guest: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  partner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  suspended: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  banned: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, activeTab])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      const users = data.users || []

      setUsers(users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (activeTab !== "all") {
      filtered = filtered.filter(user => user.role === activeTab)
    }

    setFilteredUsers(filtered)
  }

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(prev => prev.map(user =>
          user._id === userId ? { ...user, status: newStatus as any } : user
        ))
        toast.success('User status updated')
      } else {
        throw new Error('Failed to update user status')
      }
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage platform users and their permissions</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="guest">Guests</TabsTrigger>
          <TabsTrigger value="partner">Partners</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? "No users found matching your search." : "No users found."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.uid} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback>
                          {user.displayName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{user.displayName}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={roleColors[user.role]}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                            <Badge className={statusColors[user.status]}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserStatus(user.uid, 'suspended')}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserStatus(user.uid, 'banned')}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Ban User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Joined</p>
                            <p className="font-medium">{formatDate(user.createdAt)}</p>
                          </div>
                          {user.role === 'guest' && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Bookings</p>
                                <p className="font-medium">{user.bookingsCount || 0}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total Spent</p>
                                <p className="font-medium">₹{Number(user.totalSpent || 0).toLocaleString('en-IN')}</p>
                              </div>
                            </>
                          )}
                          {user.role === 'partner' && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Properties</p>
                                <p className="font-medium">{user.propertiesCount || 0}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Revenue</p>
                                <p className="font-medium">₹{Number(user.totalRevenue || 0).toLocaleString('en-IN')}</p>
                              </div>
                            </>
                          )}
                          {user.role === 'admin' && user.lastLogin && (
                            <div>
                              <p className="text-muted-foreground">Last Login</p>
                              <p className="font-medium">{formatDate(user.lastLogin)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
