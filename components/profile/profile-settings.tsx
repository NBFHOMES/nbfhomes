"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, User, Mail, Phone, MapPin } from "lucide-react"

export function ProfileSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Avatar className="h-32 w-32 mx-auto">
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback className="text-2xl">U</AvatarFallback>
          </Avatar>
          <Button variant="outline" className="w-full bg-transparent">
            <Camera className="h-4 w-4 mr-2" />
            Change Photo
          </Button>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName"  />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName"  />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email Address
            </Label>
            <Input id="email" type="email"  />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Phone Number
            </Label>
            <Input id="phone"  />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Address
            </Label>
            <Input id="address"  />
          </div>

          <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
