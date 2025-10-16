import { Navbar } from "@/components/navbar"
import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto">
          <Card className="glass-effect border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Join <span className="text-gradient">NBFHOMES</span>
              </CardTitle>
              <CardDescription>Create your account and start exploring amazing accommodations</CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
