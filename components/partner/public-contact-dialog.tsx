"use client"

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function PublicContactDialog() {
  const { mongoUser } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', email: '', phone: '' })

  React.useEffect(() => {
    const init = async () => {
      if (!mongoUser || mongoUser.role !== 'partner') return
      try {
        const res = await fetch('/api/users/public-contact')
        if (res.ok) {
          const data = await res.json()
          setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' })
          if (!data.completed) setOpen(true)
        }
      } catch {}
    }
    init()
  }, [mongoUser])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/users/public-contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!mongoUser || mongoUser.role !== 'partner') return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Public contact details</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
