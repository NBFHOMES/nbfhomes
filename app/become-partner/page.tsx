import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, DollarSign, Users, TrendingUp, Shield, Headphones, Globe, Star } from "lucide-react"
import Link from "next/link"

export default function BecomePartnerPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Maximize Revenue",
      description: "Increase your bookings by up to 40% with our global reach and marketing tools."
    },
    {
      icon: Users,
      title: "Global Audience",
      description: "Access millions of travelers worldwide looking for quality accommodations."
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Get detailed performance reports and optimize your pricing strategy."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Fast, secure payment processing with fraud protection included."
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Dedicated partner support team available around the clock."
    },
    {
      icon: Globe,
      title: "Marketing Support",
      description: "Professional photography, listing optimization, and promotional campaigns."
    }
  ]

  const features = [
    "No setup fees or hidden costs",
    "Commission-based pricing model",
    "Easy property management dashboard",
    "Real-time booking notifications",
    "Guest communication tools",
    "Revenue tracking and reporting",
    "Multi-language support",
    "Mobile-friendly partner app"
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="secondary" className="mb-4">
              Partner Program
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Become a <span className="text-gradient">Partner</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of successful property owners who trust StayHub to grow their business and maximize revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/partner-registration">Continue</Link>
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Partner with <span className="text-gradient">StayHub</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We provide everything you need to succeed in the hospitality industry
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Everything You Need to <span className="text-gradient">Succeed</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Our comprehensive platform provides all the tools and support you need to manage your property and grow your business.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Card className="p-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">15%</div>
                    <p className="text-muted-foreground mb-4">Average commission rate</p>
                    <div className="text-2xl font-bold mb-2">₹2,500</div>
                    <p className="text-muted-foreground mb-4">Average monthly earnings per property</p>
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">4.8/5 Partner Rating</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our partner program today and start earning more from your property. It takes less than 10 minutes to get started.
            </p>
            <Button size="lg" asChild>
              <Link href="/partner-registration">Continue</Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No setup fees • Free to join • Start earning immediately
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
