"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Building2,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  MessageSquare,
  Star,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Overview",
    href: "/partner",
    icon: LayoutDashboard,
  },
  {
    title: "Properties",
    href: "/partner/properties",
    icon: Building2,
  },
  {
    title: "Bookings",
    href: "/partner/bookings",
    icon: Calendar,
  },
  {
    title: "Revenue",
    href: "/partner/revenue",
    icon: DollarSign,
  },
  {
    title: "Analytics",
    href: "/partner/analytics",
    icon: BarChart3,
  },
  {
    title: "Reviews",
    href: "/partner/reviews",
    icon: Star,
  },
  {
    title: "Messages",
    href: "/partner/messages",
    icon: MessageSquare,
  },
  {
    title: "Guests",
    href: "/partner/guests",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/partner/settings",
    icon: Settings,
  },
]

export function PartnerSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-primary rounded-lg">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Partner Portal</h2>
            <p className="text-sm text-muted-foreground">Grand Palace Hotel</p>
          </div>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}
