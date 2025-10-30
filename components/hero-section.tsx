"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"

export function HeroSection() {
  const router = useRouter()
  const [category, setCategory] = useState<string>("all")
  const [query, setQuery] = useState<string>("")

  const performSearch = () => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (query.trim()) params.set('q', query.trim())
    router.push(`/hotels?${params.toString()}`)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      performSearch()
    }
  }
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
          <p className="text-lg md:text-xl font-bold-500 text-foreground/90 mb-8 text-pretty max-w-2xl mx-auto">
            Find Your Perfect Room / PG / Flat
            Discover verified and affordable rooms, PGs, and shared apartments near you.
          </p>
        </div>

        {/* Search Card */}
        <Card className="max-w-4xl mx-auto glass-effect border-2">
          <CardContent className="p-3 md:p-4">
            {/* Main search bar */}
            <div className="flex items-center gap-2 md:gap-3">
              <Select defaultValue="all" onValueChange={(v) => setCategory(v)}>
                <SelectTrigger className="h-10 md:h-12 min-w-[150px]">
                  <SelectValue placeholder="All Residential" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Residential</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House / Villa</SelectItem>
                  <SelectItem value="pg">PG / Hostel</SelectItem>
                  <SelectItem value="flat">Flatmates</SelectItem>
                  <SelectItem value="plot">Plot / Land</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder='Search "Farm house in Punjab below 1 cr"'
                  className="pl-9 h-10 md:h-12"
                  suppressHydrationWarning
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>

              {/* Removed geolocation and microphone buttons */}

              <Button size="lg" className="h-10 md:h-12 px-6 md:px-8" onClick={performSearch}>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Hotels Worldwide</div>
          </div> */}
          {/* <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">2M+</div>
            <div className="text-sm text-muted-foreground">Happy Customers</div>
          </div> */}
          {/* <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">180+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div> */}
          {/* <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div> */}
        {/* </div> */}
      </div>
    </section>
  )
}
