"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, X, MapPin, DollarSign, Bed, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import { toast } from "sonner"

interface PropertyListingFormProps {
  propertyId?: string
  isEdit?: boolean
}

export function PropertyListingForm({ propertyId, isEdit = false }: PropertyListingFormProps) {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<Array<{url: string, alt: string}>>([])
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "",
    pricePerNight: "",
    amenities: [] as string[],
    rooms: [] as Array<{ type: string; price: string; available: string }>
  })
  const { user } = useAuth()

  // Load existing property data if in edit mode
  useEffect(() => {
    if (isEdit && propertyId) {
      loadPropertyData()
    }
  }, [isEdit, propertyId])

  const loadPropertyData = async () => {
    try {
      const response = await fetch(`/api/hotels/${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        const property = data.hotel

        setFormData({
          name: property.name,
          description: property.description,
          address: property.location.address,
          city: property.location.city,
          country: property.location.country,
          pricePerNight: property.pricePerNight.toString(),
          amenities: property.amenities || [],
          rooms: property.rooms.map((room: any) => ({
            type: room.type,
            price: room.price.toString(),
            available: room.available.toString()
          }))
        })
        setImages(property.images || [])
      }
    } catch (error) {
      console.error('Failed to load property data:', error)
      toast.error('Failed to load property data')
    }
  }

  const amenitiesList = [
    "Free WiFi", "Parking", "Restaurant", "Gym", "Pool", "Spa", 
    "Room Service", "Laundry", "Business Center", "Pet Friendly"
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setLoading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          setImages(prev => [...prev, { url: data.url, alt: file.name }])
        }
      }
      toast.success("Images uploaded successfully!")
    } catch (error) {
      toast.error("Failed to upload images")
    } finally {
      setLoading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to list a property")
      return
    }

    // Validation
    if (!formData.name.trim()) {
      toast.error("Property name is required")
      return
    }
    if (!formData.description.trim()) {
      toast.error("Property description is required")
      return
    }
    if (!formData.address.trim() || !formData.city.trim() || !formData.country.trim()) {
      toast.error("Complete address information is required")
      return
    }
    if (!formData.pricePerNight || isNaN(parseInt(formData.pricePerNight)) || parseInt(formData.pricePerNight) <= 0) {
      toast.error("Valid price per night is required")
      return
    }
    if (images.length === 0) {
      toast.error("At least one property image is required")
      return
    }

    // Validate and filter rooms
    const validRooms = formData.rooms.filter((room: any) =>
      room.type.trim() &&
      room.price &&
      !isNaN(parseInt(room.price)) &&
      parseInt(room.price) > 0 &&
      room.available &&
      !isNaN(parseInt(room.available)) &&
      parseInt(room.available) >= 0
    )

    if (validRooms.length === 0) {
      toast.error("At least one room with valid price and availability is required")
      return
    }

    setLoading(true)
    try {
      const propertyData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim()
        },
        images,
        amenities: formData.amenities,
        pricePerNight: parseInt(formData.pricePerNight),
        ownerId: user.uid,
        rooms: validRooms.map((room: any) => ({
          type: room.type.trim(),
          price: parseInt(room.price),
          available: parseInt(room.available)
        }))
      }

      const url = isEdit && propertyId ? `/api/hotels/${propertyId}` : '/api/hotels'
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      })

      if (response.ok) {
        const successMessage = isEdit ? "Property updated successfully!" : "Property listed successfully!"
        toast.success(successMessage)
        // Redirect to properties page to see the updated/new property
        router.push('/partner/properties')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} property`)
      }
    } catch (error: any) {
      console.error('Property listing error:', error)
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'list'} property`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Grand Palace Hotel"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your property..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="New York"
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="United States"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Property Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload high-quality images of your property
              </p>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="max-w-xs mx-auto"
              />
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                   <div key={index} className="relative group">
                     <Image
                       src={image.url}
                       alt={image.alt}
                       width={200}
                       height={96}
                       className="w-full h-24 object-cover rounded-lg"
                     />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Rooms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing & Rooms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pricePerNight">Base Price per Night (₹)</Label>
            <Input
              id="pricePerNight"
              name="pricePerNight"
              type="number"
              value={formData.pricePerNight}
              onChange={handleInputChange}
              placeholder="199"
              required
            />
          </div>

          {/* Room Configuration */}
          <div>
            <Label>Room Configuration</Label>
            <div className="space-y-3 mt-2">
              {formData.rooms.map((room, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                  <div>
                    <Label htmlFor={`room-type-${index}`} className="text-xs">Room Type</Label>
                    <Input
                      id={`room-type-${index}`}
                      value={room.type}
                      onChange={(e) => {
                        const newRooms = [...formData.rooms]
                        newRooms[index].type = e.target.value
                        setFormData(prev => ({ ...prev, rooms: newRooms }))
                      }}
                      placeholder="Standard"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`room-price-${index}`} className="text-xs">Price per Night (₹)</Label>
                    <Input
                      id={`room-price-${index}`}
                      type="number"
                      value={room.price}
                      onChange={(e) => {
                        const newRooms = [...formData.rooms]
                        newRooms[index].price = e.target.value
                        setFormData(prev => ({ ...prev, rooms: newRooms }))
                      }}
                      placeholder="199"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`room-available-${index}`} className="text-xs">Available Rooms</Label>
                    <Input
                      id={`room-available-${index}`}
                      type="number"
                      value={room.available}
                      onChange={(e) => {
                        const newRooms = [...formData.rooms]
                        newRooms[index].available = e.target.value
                        setFormData(prev => ({ ...prev, rooms: newRooms }))
                      }}
                      placeholder="10"
                      min="0"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    {formData.rooms.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            rooms: prev.rooms.filter((_, i) => i !== index)
                          }))
                        }}
                        className="w-full"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    rooms: [...prev.rooms, { type: "Standard", price: "", available: "" }]
                  }))
                }}
                className="w-full"
              >
                <Bed className="h-4 w-4 mr-2" />
                Add Another Room Type
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenitiesList.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                />
                <Label htmlFor={amenity} className="text-sm">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (isEdit ? "Updating Property..." : "Listing Property...") : (isEdit ? "Update Property" : "List Property")}
      </Button>
    </form>
  )
}
