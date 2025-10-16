import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Phone, Mail, HelpCircle, BookOpen, Users, CreditCard, Home, DollarSign, UserCircle, Shield } from "lucide-react"
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
                Help & <span className="text-gradient">Support</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Answers to your questions and help — everything is here.
              </p>
              <p className="text-base text-muted-foreground mb-8">
                Our team is always ready to assist you.
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
                    <h3 className="font-semibold mb-2">💬 Chat with Us (WhatsApp)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Instant replies
                    </p>
                    <Button className="w-full" asChild>
                      <Link href="https://wa.me/919876543210" target="_blank">Start Chat</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">📩 Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      support@nbfhomes.com
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="mailto:support@nbfhomes.com">Send Email</Link>
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
                      <Home className="h-5 w-5 text-primary" />
                      🏠 Room & PG Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li><Link href="#list-property" className="text-sm text-muted-foreground hover:text-primary">How do I list my property?</Link></li>
                      <li><Link href="#contact-owner" className="text-sm text-muted-foreground hover:text-primary">How can I contact an owner?</Link></li>
                      <li><Link href="#listing-free" className="text-sm text-muted-foreground hover:text-primary">Is listing free?</Link></li>
                      <li><Link href="#property-types" className="text-sm text-muted-foreground hover:text-primary">Types of properties accepted</Link></li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      💰 Payments & Refunds
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li><Link href="#payment-methods" className="text-sm text-muted-foreground hover:text-primary">Payment methods</Link></li>
                      <li><Link href="#refund-policy" className="text-sm text-muted-foreground hover:text-primary">Refund process</Link></li>
                      <li><Link href="#security-deposit" className="text-sm text-muted-foreground hover:text-primary">Security deposit</Link></li>
                      <li><Link href="#rent-payment" className="text-sm text-muted-foreground hover:text-primary">Monthly rent payment</Link></li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-primary" />
                      👤 Account & Login Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li><Link href="#create-account" className="text-sm text-muted-foreground hover:text-primary">Creating an account</Link></li>
                      <li><Link href="#reset-password" className="text-sm text-muted-foreground hover:text-primary">How to reset password?</Link></li>
                      <li><Link href="#login-issues" className="text-sm text-muted-foreground hover:text-primary">Login problems</Link></li>
                      <li><Link href="#account-security" className="text-sm text-muted-foreground hover:text-primary">Account security</Link></li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      🛡️ Report Fake Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li><Link href="#report-fraud" className="text-sm text-muted-foreground hover:text-primary">How to report a fraud?</Link></li>
                      <li><Link href="#verify-listing" className="text-sm text-muted-foreground hover:text-primary">Verify listing authenticity</Link></li>
                      <li><Link href="#safety-tips" className="text-sm text-muted-foreground hover:text-primary">Safety tips</Link></li>
                      <li><Link href="#scam-prevention" className="text-sm text-muted-foreground hover:text-primary">Scam prevention</Link></li>
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
              <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
              
              <div className="space-y-4">
                <Card id="list-property">
                  <CardHeader>
                    <CardTitle className="text-lg">• How do I list my property?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      To list your property, click on "List My Property" button, fill in the property details, 
                      upload photos, and submit for verification. Our team will review and approve your listing 
                      within 24-48 hours. Listing is completely free!
                    </p>
                  </CardContent>
                </Card>

                <Card id="contact-owner">
                  <CardHeader>
                    <CardTitle className="text-lg">• How can I contact an owner?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      You need to be logged in to contact property owners. Click the "Enquiry" or "Contact Owner" 
                      button on any property listing. After confirming the fraud alert, you'll get the owner's 
                      contact details including phone number and email.
                    </p>
                  </CardContent>
                </Card>

                <Card id="listing-free">
                  <CardHeader>
                    <CardTitle className="text-lg">• Is listing free?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! Listing your property on NBFHomes is 100% free. We currently charge zero commission. 
                      You can list unlimited properties without any fees. Start earning from your property today!
                    </p>
                  </CardContent>
                </Card>

                <Card id="report-fraud">
                  <CardHeader>
                    <CardTitle className="text-lg">• How to report a fraud?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      If you encounter a fake listing or fraudulent activity, immediately contact us via WhatsApp 
                      or email at support@nbfhomes.com. Provide the property ID and details. We take fraud seriously 
                      and will investigate promptly. Never pay money before visiting the property.
                    </p>
                  </CardContent>
                </Card>

                <Card id="reset-password">
                  <CardHeader>
                    <CardTitle className="text-lg">• How to reset password?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Click on "Forgot Password" on the login page, enter your registered email address, 
                      and you'll receive a password reset link. Follow the instructions in the email to 
                      create a new password. If you don't receive the email, check your spam folder.
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
                Our team is always ready to assist you. Get in touch via WhatsApp or email.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="https://wa.me/919876543210" target="_blank">Contact Support</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="mailto:support@nbfhomes.com">Email Us</Link>
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