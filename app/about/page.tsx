import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, Globe, Award } from "lucide-react"

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
                About <span className="text-gradient">NBFHOMES</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                We're revolutionizing the way people discover and book premium accommodations worldwide. 
                Our platform connects travelers with exceptional properties and trusted hosts.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
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
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground text-lg">
                  To make exceptional travel experiences accessible to everyone through our trusted platform.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Quality Properties</h3>
                    <p className="text-sm text-muted-foreground">
                      We carefully vet every property to ensure the highest standards of quality and comfort.
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
                      Building a community of verified hosts and satisfied guests through transparency and trust.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Excellence</h3>
                    <p className="text-sm text-muted-foreground">
                      Committed to delivering exceptional service and memorable experiences for every guest.
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
                  <Badge variant="secondary" className="mb-2">Trust & Safety</Badge>
                  <h3 className="text-xl font-semibold">Security First</h3>
                  <p className="text-muted-foreground">
                    We prioritize the safety and security of our users through verified profiles, 
                    secure payments, and comprehensive fraud protection.
                  </p>
                </div>

                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">Innovation</Badge>
                  <h3 className="text-xl font-semibold">Cutting-Edge Technology</h3>
                  <p className="text-muted-foreground">
                    Leveraging the latest technology to provide seamless booking experiences 
                    and innovative features for our users.
                  </p>
                </div>

                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">Customer Focus</Badge>
                  <h3 className="text-xl font-semibold">24/7 Support</h3>
                  <p className="text-muted-foreground">
                    Our dedicated support team is available around the clock to assist 
                    with any questions or concerns you may have.
                  </p>
                </div>

                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-2">Global Reach</Badge>
                  <h3 className="text-xl font-semibold">Worldwide Network</h3>
                  <p className="text-muted-foreground">
                    Connecting travelers with amazing properties across 180+ countries 
                    and growing our global community every day.
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