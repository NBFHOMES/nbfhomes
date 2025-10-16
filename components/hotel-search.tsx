"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Users, Search } from "lucide-react"

export function HotelSearch() {
  return (
    <Card className="glass-effect border-2">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Destination
            </label>
            <Input placeholder="Where are you going?" className="h-10 md:h-12" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Check-in
            </label>
            <Input type="date" className="h-10 md:h-12" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Check-out
            </label>
            <Input type="date" className="h-10 md:h-12" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Guests
            </label>
            <Input type="number" placeholder="2" min="1" max="10" className="h-10 md:h-12" />
          </div>

          <Button size="lg" className="h-10 md:h-12 px-6 md:px-8 bg-primary hover:bg-primary/90">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
