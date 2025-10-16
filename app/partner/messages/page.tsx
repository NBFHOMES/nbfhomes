import { PartnerMessagesInbox } from "@/components/partner/messages-inbox"

export default function PartnerMessagesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Messages <span className="text-gradient">& Inbox</span>
        </h1>
        <p className="text-muted-foreground">Communicate with guests and manage support tickets</p>
      </div>
      <PartnerMessagesInbox />
    </div>
  )
}