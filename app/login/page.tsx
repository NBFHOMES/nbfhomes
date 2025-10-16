import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto">
          <Card className="glass-effect border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Welcome Back to <span className="text-gradient">NBFHOMES</span>
              </CardTitle>
              <CardDescription>Sign in to your account to continue booking amazing stays</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
              <div> 
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
