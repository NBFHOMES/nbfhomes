import { Navbar } from "@/components/navbar"
import { HotelSearch } from "@/components/hotel-search"
import { HotelFilters } from "@/components/hotel-filters"
import { HotelList } from "@/components/hotel-list"
import { Footer } from "@/components/footer"

export default function HotelsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Find Your Perfect <span className="text-gradient">Hotel</span>
          </h1>
          <p className="text-muted-foreground">Discover amazing hotels and accommodations for your next trip</p>
        </div>

        <HotelSearch />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          <div className="lg:col-span-1">
            <HotelFilters />
          </div>
          <div className="lg:col-span-3">
            <HotelList />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
