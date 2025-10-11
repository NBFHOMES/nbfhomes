"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Users, Search } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/placeholder.jpg"
          alt="Luxury hotel background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-muted/30"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
            Find Your Perfect
            <span className="text-gradient block">Stay</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Discover premium hotels and accommodations worldwide. Book with confidence and enjoy exceptional
            hospitality.
          </p>
        </div>

        {/* Search Card */}
        <Card className="max-w-4xl mx-auto glass-effect border-2">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-end">
              {/* Destination */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary mr-0" />
                  Destination
                </label>
                 <Input placeholder="Where are you going?" className="h-10 md:h-12" suppressHydrationWarning />
              </div>

               {/* Check-in */}
               <div className="space-y-2">
                 <label className="text-sm font-medium flex items-center gap-2">
                   <Calendar className="h-4 w-4 text-primary mr-0" />
                   Check-in
                 </label>
                 <Input type="date" className="h-10 md:h-12" suppressHydrationWarning />
               </div>

               {/* Check-out */}
               <div className="space-y-2">
                 <label className="text-sm font-medium flex items-center gap-2">
                   <Calendar className="h-4 w-4 text-primary mr-0" />
                   Check-out
                 </label>
                 <Input type="date" className="h-10 md:h-12" suppressHydrationWarning />
               </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary mr-0" />
                  Guests
                </label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="2" min="1" max="10" className="h-10 md:h-12" />
                  <Button size="lg" className="h-10 md:h-12 px-6 md:px-8 bg-primary hover:bg-primary/90">
                    <Search className="h-4 w-4 mr-0" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Hotels Worldwide</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">2M+</div>
            <div className="text-sm text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">180+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}
