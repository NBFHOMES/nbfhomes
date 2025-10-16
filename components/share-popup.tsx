"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Share2, Copy, X, MessageCircle, Send, Facebook } from "lucide-react"

interface SharePopupProps {
  isOpen: boolean
  onClose: () => void
  url?: string
  title?: string
  description?: string
}

export function SharePopup({ isOpen, onClose, url, title, description }: SharePopupProps) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const currentTitle = title || 'NBFHOMES - Premium Hotel Booking Platform'
  const currentDescription = description || 'Discover premium hotels and accommodations worldwide with NBFHOMES!'

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${currentTitle} - ${currentUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing, so we'll open the app
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast.success('Link copied to clipboard!')
      onClose()
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Link copied to clipboard!')
      onClose()
    }
  }

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'instagram') => {
    if (platform === 'instagram') {
      toast.info('Open Instagram and share our website in your story or posts!')
      window.open(shareUrls.instagram, '_blank')
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
    onClose()
  }

  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => handleShare('whatsapp'),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => handleShare('facebook'),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Send,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      onClick: () => handleShare('instagram'),
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: Copy,
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: handleCopyLink,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share NBFHOMES
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share NBFHOMES with your friends and family and help them discover amazing hotels!
          </p>

          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <Button
                  key={option.id}
                  variant="default"
                  className={`${option.color} text-white hover-lift h-auto py-4 flex flex-col gap-2`}
                  onClick={option.onClick}
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-sm font-medium">{option.name}</span>
                </Button>
              )
            })}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Thank you for sharing! ❤️
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}