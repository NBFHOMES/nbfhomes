import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
              <p className="text-muted-foreground text-lg">
                Last updated: January 2024
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Acceptance of Terms</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>By accessing and using NBFHOMES, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Description of Service</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>NBFHOMES is a platform that connects travelers with accommodation providers. We facilitate bookings but are not responsible for the actual accommodation services provided by hosts.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. User Accounts</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>To use certain features of our service, you must register for an account. You are responsible for:</p>
                  <ul>
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Providing accurate and complete information</li>
                    <li>Updating your information as necessary</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Booking and Payment</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>When you make a booking through our platform:</p>
                  <ul>
                    <li>You enter into a direct contractual relationship with the host</li>
                    <li>Payment processing is handled securely through our platform</li>
                    <li>Cancellation policies vary by property and are clearly stated</li>
                    <li>Refunds are subject to the applicable cancellation policy</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Host Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>If you list a property on our platform, you agree to:</p>
                  <ul>
                    <li>Provide accurate descriptions and photos</li>
                    <li>Honor confirmed bookings</li>
                    <li>Maintain your property in good condition</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Respond to guest inquiries in a timely manner</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Prohibited Uses</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>You may not use our service to:</p>
                  <ul>
                    <li>Violate any laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Transmit harmful or malicious content</li>
                    <li>Engage in fraudulent activities</li>
                    <li>Harass or harm other users</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>NBFHOMES shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Our total liability shall not exceed the amount paid by you for the specific service.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>8. Termination</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We may terminate or suspend your account and access to the service at our sole discretion, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users or our business.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>9. Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through our platform. Continued use of the service after changes constitutes acceptance of the new terms.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>10. Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>For questions about these Terms of Service, please contact us at:</p>
                  <ul>
                    <li>Email: nbfhomes@gmail.com</li>
                    {/* <li>Phone: +1 (555) 123-4567</li>
                    <li>Address: New York, NY 10001</li> */}
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