"use client"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Users, Shield, Headphones, TrendingUp, Clock } from "lucide-react"

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Extra Income",
    description: "Generate passive income from your property with competitive rates and flexible pricing.",
  },
  {
    icon: Users,
    title: "Millions of Guests",
    description: "Access our global network of verified travelers looking for quality accommodations.",
  },
  {
    icon: Shield,
    title: "Host Protection",
    description: "Comprehensive insurance coverage and secure payment processing for peace of mind.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated support team is available around the clock to help you succeed.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Track your earnings, occupancy rates, and guest reviews with detailed insights.",
  },
  {
    icon: Clock,
    title: "Quick Setup",
    description: "Get your property listed in minutes with our streamlined onboarding process.",
  },
]

export function PropertyBenefits() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Why Choose NBFHOMES?</h2>
        <p className="text-muted-foreground text-pretty">
          Join the world's leading hospitality platform and start earning from your property today.
        </p>
      </div>

      <div className="grid gap-4">
        {benefits.map((benefit, index) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{benefit.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Ready to get started?</h3>
        <p className="text-sm text-muted-foreground">
          Complete the form to list your property and start welcoming guests within 24 hours.
        </p>
      </div>
    </div>
  )
}
