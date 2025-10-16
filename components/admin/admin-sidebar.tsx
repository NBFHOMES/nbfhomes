"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  MessageSquare,
  Star,
  AlertTriangle,
  FileText,
  UserCheck,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Partner Applications",
    href: "/admin/partners",
    icon: UserCheck,
  },
  {
    title: "Properties",
    href: "/admin/properties",
    icon: Building2,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
  },
  {
    title: "Revenue",
    href: "/admin/revenue",
    icon: DollarSign,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Support",
    href: "/admin/support",
    icon: MessageSquare,
  },
  {
    title: "Security",
    href: "/admin/security",
    icon: Shield,
  },
  {
    title: "Alerts",
    href: "/admin/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-primary rounded-lg">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">System Control</p>
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
