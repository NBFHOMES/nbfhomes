import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, Shield, Award, HeadphonesIcon, CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About <span className="text-gradient">NBFHomes</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                NBFHomes is simplifying how people find and rent rooms, PGs, and homes in their city — quickly, safely, and without brokers.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {/* <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                <div className="text-sm text-muted-foreground">Properties</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">2M+</div>
                <div className="text-sm text-muted-foreground">Happy Guests</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">180+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">4.8</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </section> */}

        {/* Mission Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground text-lg">
                  Our mission is to make finding affordable and verified rental spaces easier for students, working professionals, and families.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Verified Properties</h3>
                    <p className="text-sm text-muted-foreground">
                      Every property is verified for safety, comfort, and affordability.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Trusted Community</h3>
                    <p className="text-sm text-muted-foreground">
                      We're building a trusted community of verified owners and happy tenants.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Simple & Reliable</h3>
                    <p className="text-sm text-muted-foreground">
                      We aim to make every rental experience simple, transparent, and reliable.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">No Brokers</Badge>
                  <h3 className="text-xl font-semibold">Direct Connection</h3>
                  <p className="text-muted-foreground">
                    Connect directly with property owners without any middlemen or broker fees. 
                    Save money and get transparent pricing.
                  </p>
                </div>

                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">Verified Listings</Badge>
                  <h3 className="text-xl font-semibold">Safety & Trust</h3>
                  <p className="text-muted-foreground">
                    Every property is verified for safety, comfort, and affordability. 
                    We ensure genuine listings to protect you from fraud.
                  </p>
                </div>

                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">24/7 Support</Badge>
                  <h3 className="text-xl font-semibold">Always Here to Help</h3>
                  <p className="text-muted-foreground">
                    Our support team is available 24/7 via WhatsApp or call to help you instantly. 
                    Get quick answers to all your questions.
                  </p>
                </div>

                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">Local Focus</Badge>
                  <h3 className="text-xl font-semibold">City-Wide Coverage</h3>
                  <p className="text-muted-foreground">
                    Find rooms, PGs, and homes in your city quickly and easily. 
                    Perfect for students, working professionals, and families.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}