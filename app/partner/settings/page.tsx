import { PartnerSettings } from "@/components/partner/partner-settings"

export default function PartnerSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Account <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-muted-foreground">Manage your partner account and preferences</p>
      </div>
      <PartnerSettings />
    </div>
  )
}