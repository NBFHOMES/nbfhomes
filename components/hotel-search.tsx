"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function HotelSearch() {
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
    <Card className="glass-effect border-2">
      <CardContent className="p-3 md:p-4">
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
  )
}
