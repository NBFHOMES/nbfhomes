import { AdminPropertiesManagement } from "@/components/admin/admin-properties-management"

export default function AdminPropertiesPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Property <span className="text-gradient">Management</span>
        </h1>
        <p className="text-muted-foreground">Oversee all properties, approvals, and quality standards</p>
      </div>
      <AdminPropertiesManagement />
    </>
  )
}
