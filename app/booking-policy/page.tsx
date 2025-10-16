import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, CreditCard } from "lucide-react"

export default function BookingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Booking Policy</h1>
              <p className="text-muted-foreground text-lg">
                Understanding our booking terms and conditions
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Process</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>When you make a booking through NBFHOMES:</p>
                  <ol>
                    <li>Select your desired property, dates, and number of guests</li>
                    <li>Review the property details, amenities, and house rules</li>
                    <li>Check the cancellation policy and total cost</li>
                    <li>Provide guest information and payment details</li>
                    <li>Receive booking confirmation via email</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <CreditCard className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Payment Methods</h4>
                        <p className="text-sm text-muted-foreground">
                          We accept major credit cards, PayPal, and other secure payment methods.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Payment Timing</h4>
                        <p className="text-sm text-muted-foreground">
                          Payment is processed immediately upon booking confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Each property has its own cancellation policy set by the host. Here are the common types:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-green-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Flexible</CardTitle>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Most Lenient
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Full refund until 24 hours before check-in</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">50% refund within 24 hours</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Moderate</CardTitle>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Balanced
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Full refund until 5 days before check-in</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">No refund within 5 days</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Strict</CardTitle>
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Least Flexible
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">50% refund until 14 days before</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">No refund within 14 days</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modification Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>Changes to your booking are subject to availability and the host's approval:</p>
                  <ul>
                    <li><strong>Date Changes:</strong> Subject to availability and may incur additional charges</li>
                    <li><strong>Guest Count:</strong> Must not exceed the property's maximum capacity</li>
                    <li><strong>Duration:</strong> Extending or shortening stays requires host approval</li>
                    <li><strong>Fees:</strong> Modification fees may apply depending on the change</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Check-in & Check-out</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Check-in</h4>
                      <ul className="text-sm space-y-1">
                        <li>Standard check-in: 3:00 PM - 9:00 PM</li>
                        <li>Late check-in may be available (additional fees may apply)</li>
                        <li>Valid ID required for all guests</li>
                        <li>Contact host for specific instructions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Check-out</h4>
                      <ul className="text-sm space-y-1">
                        <li>Standard check-out: 11:00 AM</li>
                        <li>Late check-out may be available upon request</li>
                        <li>Return all keys and access cards</li>
                        <li>Leave property in good condition</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guest Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>As a guest, you agree to:</p>
                  <ul>
                    <li>Provide accurate information during booking</li>
                    <li>Respect the property and follow house rules</li>
                    <li>Not exceed the maximum number of guests</li>
                    <li>Report any damages or issues immediately</li>
                    <li>Comply with local laws and regulations</li>
                    <li>Treat the property as you would your own home</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dispute Resolution</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>If issues arise during your stay:</p>
                  <ol>
                    <li>Contact your host directly to resolve the issue</li>
                    <li>If unresolved, contact NBFHOMES support within 24 hours</li>
                    <li>Provide documentation (photos, messages) if applicable</li>
                    <li>Our team will mediate and work toward a fair resolution</li>
                  </ol>
                  <p>We're committed to ensuring a positive experience for all users.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Force Majeure</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>In cases of extraordinary circumstances beyond our control (natural disasters, government restrictions, etc.), special cancellation policies may apply. We will work with guests and hosts to find fair solutions during such events.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>For questions about our booking policy or assistance with your reservation:</p>
                  <ul>
                    <li>Email: support@nbfhomes.com</li>
                    <li>Phone: +1 (555) 123-4567</li>
                    <li>Live Chat: Available 24/7 on our website</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}