"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Users,
  Bed,
  ArrowLeft,
  Share2,
  Calendar,
  Phone,
  Mail,
  Globe,
  Check
} from "lucide-react"
import { auth } from "@/lib/firebase"
import { SharePopup } from "@/components/share-popup"
import FraudAlertPopup from "@/components/fraud-alert-popup"
import OwnerDetailsPopup from "@/components/owner-details-popup"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { toast } from "sonner"


interface Hotel {
  _id: string
  name: string
  description: string
  location: {
    address: string
    city: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
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
    price: number
    available: number
  }>
  ownerId: string
  status: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const amenityIcons: { [key: string]: any } = {
  'Free WiFi': Wifi,
  'Parking': Car,
  'Restaurant': Coffee,
  'Gym': Dumbbell,
  'Swimming Pool': Users,
  'Spa': Users,
  'Room Service': Users,
  'Laundry': Users,
  'Business Center': Users,
  'Pet Friendly': Users,
  'Airport Shuttle': Car,
  'Bar': Coffee,
  'Concierge': Users,
  'Fitness Center': Dumbbell,
  'Valet Parking': Car,
  '24/7 Front Desk': Users
}

export default function HotelDetailsPage() {
  const params = useParams()
  const hotelId = params.id as string
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [mobileImageIndex, setMobileImageIndex] = useState(0)
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [showFraudAlert, setShowFraudAlert] = useState(false)
  const [showOwnerDetails, setShowOwnerDetails] = useState(false)
  const [ownerDetails, setOwnerDetails] = useState<any>(null)

  useEffect(() => {
    fetchHotel()
  }, [hotelId])

  const fetchHotel = async () => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}`)
      if (response.ok) {
        const data = await response.json()
        setHotel(data.hotel)
      } else {
        console.error('Failed to fetch hotel')
      }
    } catch (error) {
      console.error('Failed to fetch hotel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnquiry = () => {
    if (!hotel) return
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
    if (hotel) {
      fetchOwnerDetails(hotel.ownerId)
      setShowFraudAlert(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-muted rounded-lg mb-4"></div>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Hotel Not Found</h1>
              <p className="text-muted-foreground mb-6">The hotel you're looking for doesn't exist or has been removed.</p>
              <Button asChild className="w-full">
                <Link href="/hotels">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Hotels
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button variant="ghost" size="sm" asChild className="lg:hidden">
            <Link href="/hotels">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSharePopup(true)}
              className="text-muted-foreground"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Badge variant={hotel.isActive ? "default" : "secondary"}>
              {hotel.isActive ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>

        {/* Desktop Back Button */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href="/hotels">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hotels
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSharePopup(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0">
                {/* Main Image */}
                <div className="relative h-64 sm:h-80 lg:h-[500px] overflow-hidden">
                  <Image
                    src={hotel.images[selectedImageIndex]?.url || "/placeholder.jpg"}
                    alt={hotel.images[selectedImageIndex]?.alt || hotel.name}
                    fill
                    className="object-cover transition-transform duration-500"
                  />
                  {/* Image Overlay Info */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground ml-1">({hotel.reviewCount})</span>
                      </div>
                    </div>
                    {hotel.images.length > 1 && (
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                        <span className="text-sm font-medium">
                          {selectedImageIndex + 1} / {hotel.images.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Thumbnail Navigation */}
                {hotel.images.length > 1 && (
                  <div className="lg:hidden p-4 bg-white border-t">
                    <div className="flex gap-2 overflow-x-auto">
                      {hotel.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedImageIndex(index)
                            setMobileImageIndex(index)
                          }}
                          className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-primary scale-105 shadow-md'
                              : 'border-muted hover:border-muted-foreground/50'
                          }`}
                        >
                          <Image
                            src={image.url}
                            alt={image.alt || `${hotel.name} image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desktop Thumbnail Grid */}
                {hotel.images.length > 1 && (
                  <div className="hidden lg:block p-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="grid grid-cols-4 gap-3">
                      {hotel.images.slice(0, 8).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative group h-20 overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                            selectedImageIndex === index
                              ? 'border-primary shadow-lg'
                              : 'border-muted hover:border-muted-foreground/50'
                          }`}
                        >
                          <Image
                            src={image.url}
                            alt={image.alt || `${hotel.name} image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {selectedImageIndex === index && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                      {hotel.images.length > 8 && (
                        <div className="relative h-20 overflow-hidden rounded-lg border-2 border-muted bg-muted/50 flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            +{hotel.images.length - 8} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hotel Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                      {hotel.name}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{hotel.location.city}, {hotel.location.country}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
                        <span className="text-sm ml-1">({hotel.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:text-right">
                    <div className="text-2xl lg:text-3xl font-bold text-primary">
                      ₹{hotel.pricePerNight.toLocaleString('en-IN')}
                    </div>
                    <Badge
                      variant={hotel.isActive ? "default" : "secondary"}
                      className="mt-2 hidden lg:inline-flex"
                    >
                      {hotel.isActive ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {hotel.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {hotel.amenities.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Amenities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotel.amenities.map((amenity) => {
                      const IconComponent = amenityIcons[amenity]
                      return (
                        <div
                          key={amenity}
                          className="flex items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          {IconComponent && (
                            <IconComponent className="w-5 h-5 mr-3 text-primary flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rooms */}
            {hotel.rooms.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Available Rooms</h2>
                  <div className="space-y-4">
                    {hotel.rooms.map((room, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 lg:p-6 border rounded-xl hover:shadow-md transition-all bg-gradient-to-r from-muted/20 to-muted/10"
                      >
                        <div className="flex items-center mb-3 sm:mb-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                            <Bed className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{room.type}</h3>
                            <p className="text-sm text-muted-foreground">
                              {room.available} room{room.available !== 1 ? 's' : ''} available
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end">
                          <div className="text-right mr-4">
                            <div className="text-xl lg:text-2xl font-bold">
                              ₹{room.price.toLocaleString('en-IN')}
                              {/* <span className="text-sm font-normal text-muted-foreground">/night</span> */}
                            </div>
                          </div>
                          <Button size="sm" disabled={room.available === 0}>
                            {room.available > 0 ? 'Select' : 'Sold Out'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Booking Card - Sticky on desktop */}
            <Card className="lg:sticky lg:top-6 border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
                <h3 className="text-xl font-bold mb-2">Book Your Stay</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">₹{hotel.pricePerNight.toLocaleString('en-IN')}</span>
                  <span className="text-primary-foreground/80 ml-2">per night</span>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground ml-1">({hotel.reviewCount})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={hotel.isActive ? "default" : "secondary"}>
                      {hotel.isActive ? "Available" : "Unavailable"}
                    </Badge>
                  </div>

                  {hotel.rooms.length > 0 && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">Total Rooms</span>
                      <span className="font-semibold">
                        {hotel.rooms.reduce((total, room) => total + room.available, 0)}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleEnquiry}
                  disabled={!hotel.isActive}
                >
                  {hotel.isActive ? "Contact Owner" : "Currently Unavailable"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Get owner contact details after verification. No booking required.
                </p>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="border-0 shadow-lg hidden lg:block">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Property Details</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Property ID</span>
                    </div>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {hotel._id.slice(-8)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Listed</span>
                    </div>
                     <span suppressHydrationWarning>{new Date(hotel.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Updated</span>
                    </div>
                     <span suppressHydrationWarning>{new Date(hotel.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="border-0 shadow-lg hidden lg:block">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Need Help?</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </main>

      {/* Fraud Alert Popup */}
      <FraudAlertPopup
        isOpen={showFraudAlert}
        onClose={() => setShowFraudAlert(false)}
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

      {/* Share Popup */}
      {hotel && (
        <SharePopup
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={`${hotel.name} - NBFHOMES`}
          description={`${hotel.description} Located in ${hotel.location.city}, ${hotel.location.country}. Rated ${hotel.rating.toFixed(1)} stars with ${hotel.reviewCount} reviews.`}
        />
      )}

      <Footer />
    </div>
  )
}