import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
              <p className="text-muted-foreground text-lg">
                Last updated: January 2024
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>What Are Cookies?</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How We Use Cookies</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We use cookies for several purposes:</p>
                  <ul>
                    <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                    <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
                    <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
                    <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Types of Cookies We Use</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Essential Cookies</h4>
                      <p>These cookies are necessary for the website to function and cannot be switched off. They include:</p>
                      <ul>
                        <li>Authentication cookies to keep you logged in</li>
                        <li>Security cookies to protect against fraud</li>
                        <li>Session cookies to maintain your browsing session</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">Analytics Cookies</h4>
                      <p>We use analytics services like Google Analytics to understand how our website is used:</p>
                      <ul>
                        <li>Page views and user interactions</li>
                        <li>Traffic sources and user demographics</li>
                        <li>Website performance metrics</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold">Preference Cookies</h4>
                      <p>These cookies remember your choices and preferences:</p>
                      <ul>
                        <li>Language and region settings</li>
                        <li>Theme preferences (light/dark mode)</li>
                        <li>Search filters and sorting preferences</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Third-Party Cookies</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We may use third-party services that set their own cookies:</p>
                  <ul>
                    <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                    <li><strong>Payment Processors:</strong> For secure payment processing</li>
                    <li><strong>Social Media:</strong> For social sharing functionality</li>
                    <li><strong>Customer Support:</strong> For chat and support features</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Managing Cookies</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>You can control and manage cookies in several ways:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Browser Settings</h4>
                      <p>Most browsers allow you to:</p>
                      <ul>
                        <li>View and delete cookies</li>
                        <li>Block cookies from specific websites</li>
                        <li>Block third-party cookies</li>
                        <li>Clear all cookies when you close the browser</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold">Opt-Out Tools</h4>
                      <p>You can opt out of certain cookies using these tools:</p>
                      <ul>
                        <li>Google Analytics Opt-out Browser Add-on</li>
                        <li>Network Advertising Initiative opt-out page</li>
                        <li>Digital Advertising Alliance opt-out page</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cookie Consent</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>By continuing to use our website, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by:</p>
                  <ul>
                    <li>Changing your browser settings</li>
                    <li>Using our cookie preference center (if available)</li>
                    <li>Contacting us directly</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Updates to This Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p>If you have any questions about our use of cookies, please contact us at:</p>
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