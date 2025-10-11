import { UserManagement } from "@/components/admin/user-management"

export default function AdminUsersPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          User <span className="text-gradient">Management</span>
        </h1>
        <p className="text-muted-foreground">Manage all platform users, partners, and administrators</p>
      </div>
      <UserManagement />
    </>
  )
}
