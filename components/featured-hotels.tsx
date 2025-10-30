"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Wifi, Car, Coffee, Dumbbell } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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

// Fallback taglines shown when a property has no description
const demoTaglines = [
  'Indulge in Unmatched Comfort at the Heart of Every Destination.',
  'Experience the Perfect Blend of Comfort and Convenience.',
  'Discover Exceptional Value in Every Stay.',
  'Your Comfort, Our Priority.',
  'Where Every Stay is a Story.',
  'Experience the Difference of Quality Living.',
  'Where Comfort Meets Convenience.',
  'Experience the Perfect Blend of Comfort and Convenience.',
  'Discover Exceptional Value in Every Stay.',
  'Your Comfort, Our Priority.',
  'Where Every Stay is a Story.',
  'Experience the Difference of Quality Living.',
]

// If description is missing or very short, show a demo tagline instead
const MIN_DESCRIPTION_CHARS = 20

export function FeaturedHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
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
      setHotels(data.hotels?.slice(0, 4) || [])
    } catch (error) {
      console.error('Failed to fetch hotels:', error)
    } finally {
      setLoading(false)
    }
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
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured <span className="text-gradient">Hotels</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Loading amazing hotels...
            </p>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => (
               <Card key={i} className="overflow-hidden animate-pulse border py-0">
                 <div className="relative mb-2 aspect-4/3 w-full bg-muted"></div>
                 <CardContent className="px-6 py-4 space-y-4">
                   <div className="h-4 bg-muted rounded mb-2"></div>
                   <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                   <div className="h-8 bg-muted rounded"></div>
                 </CardContent>
               </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured <span className="text-gradient">Properties</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium accommodations worldwide
          </p>
        </div>

        {hotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hotels available at the moment.</p>
            <Button asChild className="mt-4">
              <Link href="/become-partner">Become a Partner</Link>
            </Button>
          </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotels.slice(0, 4).map((hotel, index) => (
              <Card key={hotel._id} className="overflow-hidden hover:shadow-lg transition-shadow group border py-0 h-full flex flex-col">
                  <figure className="relative mb-2 aspect-3/2 w-full">
                    <Image
                      src={hotel.images[0]?.url}
                      alt={hotel.images[0]?.alt || hotel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                   <div className="absolute top-3 right-3">
                     <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                         <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                       {hotel.rating.toFixed(1)}
                     </Badge>
                   </div>
                 </figure>

                  <CardContent className="px-6 py-4 flex flex-col">
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="text-2xl font-bold">{hotel.name}</div>
                        <div className="mt-2 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-4 ${
                                i < Math.floor(hotel.rating)
                                  ? "fill-current text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-muted-foreground ml-2 text-sm">
                            ({hotel.rating.toFixed(1)})
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 min-h-[40px]">{
                        ((hotel.description ?? '').replace(/\s+/g, ' ').trim().length >= MIN_DESCRIPTION_CHARS)
                          ? (hotel.description ?? '').trim()
                          : demoTaglines[index % demoTaglines.length]
                      }</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold lg:text-2xl">
                          ₹{hotel.pricePerNight.toLocaleString('en-IN')}
                        </span>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEnquiry(hotel)}
                      >
                        Enquiry
                      </Button>
                      <Button asChild className="flex-1">
                        <Link href={`/hotels/${hotel._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/hotels">View All Hotels</Link>
          </Button>
        </div>
      </div>

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
    </section>
  )
}
