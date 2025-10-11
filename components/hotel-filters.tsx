"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Star, Wifi, Car, Coffee, Dumbbell, Waves, Utensils } from "lucide-react"

export function HotelFilters() {
  const [priceRange, setPriceRange] = React.useState([50, 500])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider value={priceRange} onValueChange={setPriceRange} max={1000} min={0} step={10} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Star Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox id={`rating-${rating}`} />
                <label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  {Array.from({ length: 5 - rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-gray-300" />
                  ))}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: "wifi", label: "Free WiFi", icon: Wifi },
              { id: "parking", label: "Free Parking", icon: Car },
              { id: "restaurant", label: "Restaurant", icon: Utensils },
              { id: "gym", label: "Fitness Center", icon: Dumbbell },
              { id: "pool", label: "Swimming Pool", icon: Waves },
              { id: "breakfast", label: "Free Breakfast", icon: Coffee },
            ].map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox id={amenity.id} />
                <label htmlFor={amenity.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <amenity.icon className="h-4 w-4 text-muted-foreground" />
                  {amenity.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full bg-transparent">
        Clear Filters
      </Button>
    </div>
  )
}
