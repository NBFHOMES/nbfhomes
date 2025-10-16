"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Eye, MoreHorizontal, MapPin, Star, DollarSign, Share2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Property {
  _id: string
  name: string
  location: {
    city: string
    country: string
  }
  images: Array<{
    url: string
    alt?: string
  }>
  rating: number
  reviewCount: number
  pricePerNight: number
  rooms: Array<{
    type: string
    available: number
  }>
  isActive: boolean
  occupancyRate?: number
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function PropertiesManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPropertiesAndBookings()
    }
  }, [user])

  const fetchPropertiesAndBookings = async () => {
    try {
      // Fetch properties
      const propertiesResponse = await fetch(`/api/hotels?ownerId=${user?.uid}&includeInactive=true`)
      const propertiesData = await propertiesResponse.json()
      const propertiesList = propertiesData.hotels || []

      // Fetch bookings for occupancy calculation
      const bookingsResponse = await fetch(`/api/bookings?ownerId=${user?.uid}`)
      const bookingsData = await bookingsResponse.json()
      const bookingsList = bookingsData.bookings || []

      // Calculate occupancy for each property
      const propertiesWithOccupancy = propertiesList.map((property: Property) => {
        const propertyBookings = bookingsList.filter((booking: any) =>
          booking.hotelId._id === property._id &&
          (booking.status === 'confirmed' || booking.status === 'completed')
        )

        // Simple occupancy calculation - count of active bookings vs total rooms
        const totalRooms = property.rooms.reduce((sum, room) => sum + room.available, 0)
        const occupancyRate = totalRooms > 0 ? Math.round((propertyBookings.length / totalRooms) * 100) : 0

        return {
          ...property,
          occupancyRate: Math.min(occupancyRate, 100) // Cap at 100%
        }
      })

      setProperties(propertiesWithOccupancy)
      setBookings(bookingsList)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTotalRooms = (rooms: Array<{type: string, available: number}>) => {
    return rooms.reduce((total, room) => total + room.available, 0)
  }

  const handleShare = async (property: Property) => {
    if (typeof window === "undefined") {
      return
    }

    const shareUrl = `${window.location.origin}/hotels/${property._id}`
    const shareData = {
      title: property.name,
      text: `Check out ${property.name} on NBFHOMES`,
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Share failed:", error)
          toast.error("Unable to share property")
        }
      }
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Property link copied to clipboard")
    } catch (error) {
      console.error("Failed to copy share link:", error)
      toast.error("Could not copy link. Please try again.")
    }
  }



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
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
          <p className="text-muted-foreground">Manage your hotel listings and availability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPropertiesAndBookings} disabled={loading}>
            Refresh
          </Button>
          <Button asChild>
            <Link href="/partner/add-property">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No properties found matching your search." : "No properties found."}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredProperties.map((property) => (
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
                        <Badge className={statusColors[property.isActive ? 'active' : 'inactive']}>
                          {property.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/hotels/${property._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/partner/edit-property/${property._id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Property
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Rooms</p>
                        <p className="font-semibold">{getTotalRooms(property.rooms)}</p>
                      </div>
                       <div>
                         <p className="text-muted-foreground">Occupancy</p>
                         <p className="font-semibold">{property.occupancyRate || 0}%</p>
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
                        <div className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          <span className="font-semibold">{property.pricePerNight}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleShare(property)}>
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/hotels/${property._id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/partner/edit-property/${property._id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
