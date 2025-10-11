import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground text-lg">
                Last updated: January 2024
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We collect information you provide directly to us, such as when you:</p>
                  <ul>
                    <li>Create an account or profile</li>
                    <li>Make a booking or list a property</li>
                    <li>Contact us for support</li>
                    <li>Subscribe to our newsletter</li>
                  </ul>
                  <p>This may include your name, email address, phone number, payment information, and other details necessary to provide our services.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We use the information we collect to:</p>
                  <ul>
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send you technical notices and support messages</li>
                    <li>Communicate with you about products, services, and events</li>
                    <li>Monitor and analyze trends and usage</li>
                    <li>Detect, investigate, and prevent fraudulent transactions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Information Sharing</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We may share your information in the following situations:</p>
                  <ul>
                    <li>With your consent or at your direction</li>
                    <li>With service providers who perform services on our behalf</li>
                    <li>For legal reasons or to protect rights and safety</li>
                    <li>In connection with a business transfer or acquisition</li>
                  </ul>
                  <p>We do not sell, trade, or otherwise transfer your personal information to third parties for marketing purposes.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Data Security</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Your Rights</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>You have the right to:</p>
                  <ul>
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to processing of your personal information</li>
                    <li>Request data portability</li>
                    <li>Withdraw consent where applicable</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Cookies and Tracking</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We use cookies and similar tracking technologies to collect and use personal information about you. For more information about our use of cookies, please see our Cookie Policy.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                  <ul>
                    <li>Email: privacy@nbfhomes.com</li>
                    <li>Phone: +1 (555) 123-4567</li>
                    <li>Address: New York, NY 10001</li>
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