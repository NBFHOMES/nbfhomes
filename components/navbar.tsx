"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, User, Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { user, mongoUser, loading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="StayHub logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="text-xl font-bold text-gradient">NBFHOMES</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/hotels" className="text-sm font-medium hover:text-primary transition-colors">
              Properties
            </Link>
            <Link
              href="/become-partner"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Post Properties
            </Link>
            {user && (
              <>
                {mongoUser?.role === 'partner' && (
                  <Link href="/partner" className="text-sm font-medium hover:text-primary transition-colors">
                    Partner Portal
                  </Link>
                )}
                {mongoUser?.role === 'admin' && (
                  <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {!loading && (
              <>
                {user ? (
                  /* User Menu */
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL || "/placeholder.svg?height=32&width=32"} alt="User" />
                          <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  /* Auth Buttons */
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    {/* <Button asChild>
                      <Link href="/register">Sign Up</Link>
                    </Button> */}
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link href="/" className="block px-3 py-2 text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/hotels" className="block px-3 py-2 text-sm font-medium hover:text-primary transition-colors">
                Hotels
              </Link>
              <Link
                href="/become-partner"
                className="block px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Become a Partner
              </Link>
              {user && (
                <>
                  {mongoUser?.role === 'partner' && (
                    <Link
                      href="/partner"
                      className="block px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      Partner Portal
                    </Link>
                  )}
                  {mongoUser?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
              {!loading && !user && (
                <div className="px-3 py-2 space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  {/* <Button className="w-full" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button> */}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
