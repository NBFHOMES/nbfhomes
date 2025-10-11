import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Calendar, DollarSign } from "lucide-react"

export default function CancellationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Cancellation Policy</h1>
              <p className="text-muted-foreground text-lg">
                Understanding our cancellation terms and refund process
              </p>
            </div>

            <div className="space-y-8">
              {/* Overview */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Important Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Each property on NBFHOMES has its own cancellation policy set by the host. 
                    The policy is clearly displayed on the property listing and during the booking process. 
                    Please review the specific policy before confirming your reservation.
                  </p>
                </CardContent>
              </Card>

              {/* Cancellation Types */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-green-700">Flexible</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Guest Friendly</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Full Refund</p>
                          <p className="text-xs text-muted-foreground">Cancel up to 24 hours before check-in</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <DollarSign className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">50% Refund</p>
                          <p className="text-xs text-muted-foreground">Cancel within 24 hours of check-in</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Service fees are fully refundable if cancelled within 48 hours of booking
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-yellow-700">Moderate</CardTitle>
                      <Badge className="bg-yellow-100 text-yellow-800">Balanced</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Full Refund</p>
                          <p className="text-xs text-muted-foreground">Cancel up to 5 days before check-in</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <DollarSign className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">50% Refund</p>
                          <p className="text-xs text-muted-foreground">Cancel within 5 days (first night non-refundable)</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Service fees refundable if cancelled within 48 hours of booking
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-red-700">Strict</CardTitle>
                      <Badge className="bg-red-100 text-red-800">Host Friendly</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">50% Refund</p>
                          <p className="text-xs text-muted-foreground">Cancel up to 14 days before check-in</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">No Refund</p>
                          <p className="text-xs text-muted-foreground">Cancel within 14 days of check-in</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Service fees only refundable if cancelled within 48 hours of booking
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* How to Cancel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    How to Cancel Your Booking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Online Cancellation</h4>
                      <ol className="space-y-2 text-sm">
                        <li>1. Log into your NBFHOMES account</li>
                        <li>2. Go to "My Bookings" or "Trips"</li>
                        <li>3. Find your reservation and click "Cancel"</li>
                        <li>4. Review the cancellation policy and refund amount</li>
                        <li>5. Confirm your cancellation</li>
                        <li>6. Receive confirmation email</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Contact Support</h4>
                      <div className="space-y-3 text-sm">
                        <p>If you need assistance with cancellation:</p>
                        <ul className="space-y-1">
                          <li>• Phone: +1 (555) 123-4567</li>
                          <li>• Email: support@nbfhomes.com</li>
                          <li>• Live Chat: Available 24/7</li>
                        </ul>
                        <p className="text-muted-foreground">
                          Have your booking confirmation number ready when contacting support.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refund Process */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Refund Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">Processing Time</h4>
                      <p className="text-sm text-muted-foreground">
                        Refunds are processed within 5-10 business days after cancellation
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">Refund Method</h4>
                      <p className="text-sm text-muted-foreground">
                        Refunds are issued to the original payment method used for booking
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">Currency</h4>
                      <p className="text-sm text-muted-foreground">
                        Refunds are processed in the original booking currency
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Special Circumstances */}
              <Card>
                <CardHeader>
                  <CardTitle>Special Circumstances</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">Extenuating Circumstances</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Full refunds may be available for situations beyond your control:
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• Natural disasters</li>
                        <li>• Government travel restrictions</li>
                        <li>• Medical emergencies</li>
                        <li>• Death in family</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-700">Host Cancellations</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        If a host cancels your booking:
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• Full refund guaranteed</li>
                        <li>• Assistance finding alternative accommodation</li>
                        <li>• Possible compensation for inconvenience</li>
                        <li>• Host may face penalties</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle>Cancellation Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm">
                      <li>• Always check the cancellation policy before booking</li>
                      <li>• Consider travel insurance for added protection</li>
                      <li>• Cancel as early as possible for better refund terms</li>
                    </ul>
                    <ul className="space-y-2 text-sm">
                      <li>• Keep documentation for extenuating circumstances</li>
                      <li>• Contact the host first to discuss alternatives</li>
                      <li>• Save your cancellation confirmation email</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Need Help with Cancellation?</h3>
                  <p className="mb-4 opacity-90">
                    Our support team is here to assist you with any questions about cancelling your booking.
                  </p>
                  <Button variant="secondary" size="lg">
                    Contact Support
                  </Button>
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