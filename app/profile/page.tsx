import { Navbar } from "@/components/navbar"
import { ProfileSettings } from "@/components/profile/profile-settings"
import { BookingHistory } from "@/components/profile/booking-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            My <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-muted-foreground">Manage your account settings and view your booking history</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingHistory />
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Your favorite hotels will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Account settings coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
