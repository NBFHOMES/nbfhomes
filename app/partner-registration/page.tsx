import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PartnerRegistrationForm } from "@/components/partner-registration-form"

export default function PartnerRegistrationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Partner <span className="text-gradient">Registration</span>
            </h1>
            <p className="text-muted-foreground">
              Complete your registration to become an NBFHOMES partner
            </p>
          </div>
          <PartnerRegistrationForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
