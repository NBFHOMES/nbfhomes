import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Phone, Mail, HelpCircle, BookOpen, Users, CreditCard } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                How can we <span className="text-gradient">help</span> you?
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Find answers to common questions or get in touch with our support team.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  placeholder="Search for help articles..." 
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Get Help Quickly</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Live Chat</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Chat with our support team in real-time
                    </p>
                    <Button className="w-full">Start Chat</Button>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Call Us</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Speak directly with our support team
                    </p>
                    <Button variant="outline" className="w-full">
                      +1 (555) 123-4567
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send us a detailed message
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/contact">Send Email</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Popular Help Topics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Booking & Reservations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">How to make a booking</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Modifying your reservation</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Cancellation policy</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Booking confirmation</Link></li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payments & Billing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Payment methods</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Refund process</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Billing issues</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Currency and taxes</Link></li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Account & Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Creating an account</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Profile settings</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Password reset</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Account security</Link></li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      Host Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Listing your property</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Managing bookings</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Pricing strategies</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Host guidelines</Link></li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Common Questions */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How do I make a booking?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      To make a booking, search for your destination, select your dates and number of guests, 
                      choose a property, and follow the booking process. You'll need to create an account 
                      and provide payment information to complete your reservation.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What is your cancellation policy?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Cancellation policies vary by property and are set by individual hosts. You can view 
                      the specific cancellation policy for each property on its listing page before booking. 
                      Most properties offer flexible, moderate, or strict cancellation policies.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How do I contact my host?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      After making a booking, you can contact your host through our messaging system. 
                      You'll find the messaging option in your booking details. For urgent matters, 
                      host contact information may be provided after confirmation.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We accept major credit cards (Visa, Mastercard, American Express), PayPal, 
                      and other local payment methods depending on your location. All payments are 
                      processed securely through our encrypted payment system.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-lg mb-8 opacity-90">
                Our support team is available 24/7 to assist you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Contact Support
                </Button>
                <Button size="lg" variant="outline">
                  Browse All Articles
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}