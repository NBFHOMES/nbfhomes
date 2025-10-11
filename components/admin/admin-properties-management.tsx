"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MoreHorizontal, MapPin, Star, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Image from "next/image"

interface Property {
  _id: string
  name: string
  description: string
  location: {
    address: string
    city: string
    country: string
  }
  images: Array<{
    url: string
    alt?: string
  }>
  amenities: string[]
  rating: number
  reviewCount: number
  pricePerNight: number
  rooms: Array<{
    type: string
    available: number
  }>
  ownerId: string
  isActive: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

const statusColors = {
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusIcons = {
  approved: CheckCircle,
  pending: Clock,
  rejected: XCircle,
}

export function AdminPropertiesManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    filterProperties()
  }, [properties, searchTerm, activeTab])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/hotels?includeInactive=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }
      
      const data = await response.json()
      const hotels = data.hotels || []

      // Ensure all required fields are present with fallbacks
      const processedHotels = hotels.map((hotel: any) => ({
        _id: hotel._id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: hotel.name || 'Unnamed Property',
        description: hotel.description || 'No description available',
        location: {
          address: hotel.location?.address || 'No address',
          city: hotel.location?.city || 'Unknown City',
          country: hotel.location?.country || 'Unknown Country'
        },
        images: Array.isArray(hotel.images) ? hotel.images : [],
        amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
        rating: typeof hotel.rating === 'number' ? hotel.rating : 0,
        reviewCount: typeof hotel.reviewCount === 'number' ? hotel.reviewCount : 0,
        pricePerNight: typeof hotel.pricePerNight === 'number' ? hotel.pricePerNight : 0,
        rooms: Array.isArray(hotel.rooms) ? hotel.rooms : [],
        ownerId: hotel.ownerId || 'unknown',
        isActive: typeof hotel.isActive === 'boolean' ? hotel.isActive : false,
        status: hotel.status || 'pending',
        createdAt: hotel.createdAt || new Date().toISOString(),
        updatedAt: hotel.updatedAt || new Date().toISOString()
      }))

      setProperties(processedHotels)
    } catch (error) {
      console.error('Failed to fetch properties:', error)
      toast.error('Failed to load properties')
      setProperties([]) // Set empty array to prevent undefined errors
    } finally {
      setLoading(false)
    }
  }

  const filterProperties = () => {
    // Ensure properties is an array
    let filtered = Array.isArray(properties) ? properties : []

    // Filter by search term
    if (searchTerm && filtered.length > 0) {
      filtered = filtered.filter(property =>
        (property.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (property.location?.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (property.location?.country?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (activeTab !== "all" && filtered.length > 0) {
      filtered = filtered.filter(property => property.status === activeTab)
    }

    setFilteredProperties(filtered)
  }

  const updatePropertyStatus = async (propertyId: string, newStatus: string) => {
    try {
      // Validate inputs
      if (!propertyId || !newStatus) {
        toast.error('Invalid property or status')
        return
      }

      // Show loading toast
      toast.loading('Updating property status...')

      const response = await fetch(`/api/hotels/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          isActive: newStatus === 'approved'
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update local state
        setProperties(prev => {
          if (!Array.isArray(prev)) return []
          
          return prev.map(property =>
            property._id === propertyId
              ? { 
                  ...property, 
                  status: newStatus as any, 
                  isActive: newStatus === 'approved',
                  updatedAt: new Date().toISOString()
                }
              : property
          )
        })
        
        toast.dismiss()
        toast.success(`Property ${newStatus} successfully`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update property')
      }
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to update property status')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getTotalRooms = (rooms: Array<{type: string, available: number}> | undefined) => {
    if (!Array.isArray(rooms)) return 0
    return rooms.reduce((total, room) => total + (room?.available || 0), 0)
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
                  <div className="w-32 h-20 bg-muted rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                    <div className="h-8 bg-muted rounded w-24"></div>
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
          <h2 className="text-2xl font-bold">Properties Management</h2>
          <p className="text-muted-foreground">Review and manage property listings</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by property name or location..."
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
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredProperties.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? "No properties found matching your search." : "No properties found."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredProperties.map((property) => {
                const StatusIcon = statusIcons[property.status]
                return (
                  <Card key={property._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                         <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                           <Image
                             src={property.images[0]?.url || "/placeholder.jpg"}
                             alt={property.images[0]?.alt || property.name}
                             width={128}
                             height={80}
                             className="w-full h-full object-cover"
                           />
                         </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg truncate">{property.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-1" />
                                {property.location.city}, {property.location.country}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[property.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {property.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem onClick={() => updatePropertyStatus(property._id, 'approved')}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updatePropertyStatus(property._id, 'rejected')}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {property.status === 'approved' && (
                                    <DropdownMenuItem onClick={() => updatePropertyStatus(property._id, 'rejected')}>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Suspend
                                    </DropdownMenuItem>
                                  )}
                                  {property.status === 'rejected' && (
                                    <DropdownMenuItem onClick={() => updatePropertyStatus(property._id, 'approved')}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {property.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Rooms</p>
                              <p className="font-semibold">{getTotalRooms(property.rooms)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Rating</p>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{property.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground ml-1">({property.reviewCount})</span>
                              </div>
                            </div>
                            <div>
                              {/* <p className="text-muted-foreground">Price/Night</p> */}
                              <p className="font-semibold">₹{property.pricePerNight.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Submitted</p>
                              <p className="font-semibold">{formatDate(property.createdAt)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <span className="text-xs text-muted-foreground">
                              Owner ID: {property.ownerId.slice(-8)}
                            </span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {property.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => updatePropertyStatus(property._id, 'approved')}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => updatePropertyStatus(property._id, 'rejected')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
