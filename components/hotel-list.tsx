"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell, Heart } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import FraudAlertPopup from "@/components/fraud-alert-popup"
import OwnerDetailsPopup from "@/components/owner-details-popup"
import { LoginDialog } from "@/components/auth/login-dialog"
import { toast } from "sonner"

interface Hotel {
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
  ownerId: string
}

const amenityIcons: { [key: string]: any } = {
  'Free WiFi': Wifi,
  'Parking': Car,
  'Restaurant': Coffee,
  'Gym': Dumbbell,
}

export function HotelList() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showFraudAlert, setShowFraudAlert] = useState(false)
  const [showOwnerDetails, setShowOwnerDetails] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [ownerDetails, setOwnerDetails] = useState<any>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels')
      const data = await response.json()
      setHotels(data.hotels || [])
    } catch (error) {
      console.error('Failed to fetch hotels:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (hotelId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(hotelId)) {
        newFavorites.delete(hotelId)
      } else {
        newFavorites.add(hotelId)
      }
      return newFavorites
    })
  }

  const handleEnquiry = async (hotel: Hotel) => {
    // Check if user is logged in
    if (!user) {
      setShowLoginDialog(true)
      return
    }
    
    setSelectedHotel(hotel)
    setShowFraudAlert(true)
  }

  const fetchOwnerDetails = async (ownerId: string) => {
    try {
      const response = await fetch(`/api/public/owners/${ownerId}`)
      if (response.ok) {
        const ownerData = await response.json()
        setOwnerDetails(ownerData)
        setShowOwnerDetails(true)
      } else {
        toast.error('Failed to fetch owner details')
      }
    } catch (error) {
      console.error('Error fetching owner details:', error)
      toast.error('Failed to fetch owner details')
    }
  }

  const handleConfirmEnquiry = () => {
    if (selectedHotel) {
      fetchOwnerDetails(selectedHotel.ownerId)
      setShowFraudAlert(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-80 h-48 bg-muted"></div>
              <CardContent className="flex-1 p-6">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4 w-2/3"></div>
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No Properties found matching your criteria.</p>
        <Button asChild>
          <Link href="/become-partner">Post Properties</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hotels.length} properties found
        </p>
      </div>

      {hotels.map((hotel) => (
        <Card key={hotel._id} className="overflow-hidden hover:shadow-lg transition-shadow py-0">
          <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-80 h-48 overflow-hidden">
               <Image
                 src={hotel.images[0]?.url || "/placeholder.jpg"}
                 alt={hotel.images[0]?.alt || hotel.name}
                 fill
                 className="object-cover"
               />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur hover:bg-background"
                onClick={() => toggleFavorite(hotel._id)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    favorites.has(hotel._id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  }`}
                />
              </Button>
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                  <Star className="w-3 h-3 mr-0 fill-yellow-400 text-yellow-400" />
                  {hotel.rating.toFixed(1)}
                </Badge>
              </div>
            </div>

            <CardContent className="flex-1 p-6">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                      {hotel.name}
                    </h3>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-0" />
                    {hotel.location.city}, {hotel.location.country}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {hotel.description}
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4">
                    {hotel.amenities.slice(0, 4).map((amenity) => {
                      const IconComponent = amenityIcons[amenity]
                      return (
                        <div key={amenity} className="flex items-center text-xs text-muted-foreground">
                          {IconComponent && <IconComponent className="w-3 h-3 mr-0" />}
                          {amenity}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold">₹{hotel.pricePerNight.toLocaleString('en-IN')}</span>
                      {/* <span className="text-sm text-muted-foreground ml-1">/night</span> */}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {hotel.reviewCount} reviews
                    </p>
                  </div>
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" asChild>
                       <Link href={`/hotels/${hotel._id}`}>
                         View Details
                       </Link>
                     </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEnquiry(hotel)}
                      >
                        Enquiry
                      </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}

      {/* Fraud Alert Popup */}
      <FraudAlertPopup
        isOpen={showFraudAlert}
        onClose={() => {
          setShowFraudAlert(false)
          setSelectedHotel(null)
        }}
        onConfirm={handleConfirmEnquiry}
        isEnquiry={true}
      />

      {/* Owner Details Popup */}
      {ownerDetails && (
        <OwnerDetailsPopup
          isOpen={showOwnerDetails}
          onClose={() => {
            setShowOwnerDetails(false)
            setOwnerDetails(null)
          }}
          ownerDetails={{
            name: ownerDetails.name,
            email: ownerDetails.email,
            phoneNumber: ownerDetails.phoneNumber,
            businessName: ownerDetails.businessName,
            address: ownerDetails.address,
            joinedDate: new Date(ownerDetails.createdAt).getFullYear().toString(),
            propertyCount: ownerDetails.propertiesCount
          }}
        />
      )}

      {/* Login Dialog */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  )
}
