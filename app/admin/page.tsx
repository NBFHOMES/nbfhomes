import { AdminOverview } from "@/components/admin/admin-overview"

export default function AdminDashboardPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Admin <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">Manage the entire StayHub platform and monitor system performance</p>
      </div>
      <AdminOverview />
    </>
  )
}
