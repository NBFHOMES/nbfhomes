"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Upload, Camera, User, Mail, Phone, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"

export function PartnerRegistrationForm() {
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    verification: false
  })
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [images, setImages] = useState({
    selfie: null as File | null,
    aadharFront: null as File | null,
    aadharBack: null as File | null
  })
  const [previews, setPreviews] = useState({
    selfie: "",
    aadharFront: "",
    aadharBack: ""
  })

  const selfieRef = useRef<HTMLInputElement>(null)
  const aadharFrontRef = useRef<HTMLInputElement>(null)
  const aadharBackRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleImageUpload = (type: 'selfie' | 'aadharFront' | 'aadharBack', file: File) => {
    setImages(prev => ({ ...prev, [type]: file }))
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviews(prev => ({ ...prev, [type]: e.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (type: 'selfie' | 'aadharFront' | 'aadharBack') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(type, file)
    }
  }

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: checked }))
  }

  const uploadToImageKit = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) throw new Error('Upload failed')
    return await response.json()
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!images.selfie || !images.aadharFront || !images.aadharBack) {
      toast.error("Please upload all required images")
      return
    }

    setShowPopup(true)
  }

  const handleFinalSubmit = async () => {
    if (!agreements.terms || !agreements.privacy || !agreements.verification) {
      toast.error("Please accept all agreements")
      return
    }

    setLoading(true)
    try {
      // Upload images to ImageKit
      const [selfieUpload, aadharFrontUpload, aadharBackUpload] = await Promise.all([
        uploadToImageKit(images.selfie!),
        uploadToImageKit(images.aadharFront!),
        uploadToImageKit(images.aadharBack!)
      ])

      // Submit partner application to API
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        documents: {
          selfie: selfieUpload.url,
          aadharFront: aadharFrontUpload.url,
          aadharBack: aadharBackUpload.url
        },
        agreements
      }

      const response = await fetch('/api/partner-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      toast.success("Partner application submitted successfully! Your application will be reviewed by our team.")
      setShowPopup(false)
      router.push("/")
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || "Failed to submit registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Document Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selfie Upload */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4" />
                Real-time Selfie
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                {previews.selfie ? (
                  <div className="space-y-4">
                     <Image src={previews.selfie} alt="Selfie" width={128} height={128} className="w-32 h-32 object-cover rounded-lg mx-auto" />
                    <Button type="button" variant="outline" onClick={() => selfieRef.current?.click()}>
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">Upload a clear selfie for verification</p>
                    <Button type="button" variant="outline" onClick={() => selfieRef.current?.click()}>
                      Take/Upload Selfie
                    </Button>
                  </div>
                )}
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange('selfie')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Aadhar Front */}
            <div>
              <Label className="mb-2 block">Aadhar Card (Front)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                {previews.aadharFront ? (
                  <div className="space-y-4">
                     <Image src={previews.aadharFront} alt="Aadhar Front" width={192} height={128} className="w-48 h-32 object-cover rounded-lg mx-auto" />
                    <Button type="button" variant="outline" onClick={() => aadharFrontRef.current?.click()}>
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">Upload front side of Aadhar card</p>
                    <Button type="button" variant="outline" onClick={() => aadharFrontRef.current?.click()}>
                      Upload Front
                    </Button>
                  </div>
                )}
                <input
                  ref={aadharFrontRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange('aadharFront')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Aadhar Back */}
            <div>
              <Label className="mb-2 block">Aadhar Card (Back)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                {previews.aadharBack ? (
                  <div className="space-y-4">
                     <Image src={previews.aadharBack} alt="Aadhar Back" width={192} height={128} className="w-48 h-32 object-cover rounded-lg mx-auto" />
                    <Button type="button" variant="outline" onClick={() => aadharBackRef.current?.click()}>
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">Upload back side of Aadhar card</p>
                    <Button type="button" variant="outline" onClick={() => aadharBackRef.current?.click()}>
                      Upload Back
                    </Button>
                  </div>
                )}
                <input
                  ref={aadharBackRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange('aadharBack')}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Submit Registration
        </Button>
      </form>

      {/* Confirmation Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreements.terms}
                onCheckedChange={(checked) => handleAgreementChange('terms', checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the Terms and Conditions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy"
                checked={agreements.privacy}
                onCheckedChange={(checked) => handleAgreementChange('privacy', checked as boolean)}
              />
              <Label htmlFor="privacy" className="text-sm">
                I agree to the Privacy Policy
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verification"
                checked={agreements.verification}
                onCheckedChange={(checked) => handleAgreementChange('verification', checked as boolean)}
              />
              <Label htmlFor="verification" className="text-sm">
                I confirm that all provided information and documents are accurate
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPopup(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
