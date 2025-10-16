"use client"

import { useState } from 'react'
import { X, Phone, Mail, MapPin, Building, User, Clock, CheckCircle } from 'lucide-react'

interface OwnerDetailsPopupProps {
  isOpen: boolean
  onClose: () => void
  ownerDetails: {
    name: string
    email: string
    phoneNumber?: string
    businessName?: string
    address?: {
      street?: string
      city?: string
      state?: string
      country?: string
    }
    joinedDate?: string
    propertyCount?: number
  }
}

export default function OwnerDetailsPopup({ isOpen, onClose, ownerDetails }: OwnerDetailsPopupProps) {
  if (!isOpen) return null

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Owner Details</h2>
          </div>
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Building className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        {/* Owner Information */}
        <div className="space-y-4">
          {/* Name and Business */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{ownerDetails.name}</h3>
            {ownerDetails.businessName && (
              <p className="text-sm text-gray-600 mt-1">{ownerDetails.businessName}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>

            {/* Email */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-700">{ownerDetails.email}</span>
              </div>
              <button
                onClick={() => handleCopyToClipboard(ownerDetails.email, 'email')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Copy
              </button>
            </div>

            {/* Phone */}
            {ownerDetails.phoneNumber && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-sm text-gray-700">{ownerDetails.phoneNumber}</span>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(ownerDetails.phoneNumber!, 'phone')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            )}
          </div>

          {/* Address */}
          {ownerDetails.address && (
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900">Business Address</h4>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-500 mr-3 mt-0.5" />
                <div className="text-sm text-gray-700">
                  {ownerDetails.address.street && <p>{ownerDetails.address.street}</p>}
                  {ownerDetails.address.city && ownerDetails.address.state && (
                    <p>
                      {ownerDetails.address.city}, {ownerDetails.address.state}
                      {ownerDetails.address.country && `, ${ownerDetails.address.country}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Verification Badge */}
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Verified Owner</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              This owner has been verified by NBFHOMES
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{ownerDetails.propertyCount || 0}</div>
              <div className="text-xs text-gray-600">Properties</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-2xl font-bold text-blue-600">
                <Clock className="h-5 w-5 mr-1" />
              </div>
              <div className="text-xs text-gray-600">Member since {ownerDetails.joinedDate || '2024'}</div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              <span className="font-medium">Safety Reminder:</span> Always verify property details and meet in safe, public locations. NBFHOMES is not responsible for external transactions.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => {
              window.open(`mailto:${ownerDetails.email}`, '_blank')
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </button>

          {ownerDetails.phoneNumber && (
            <button
              onClick={() => {
                window.open(`tel:${ownerDetails.phoneNumber}`, '_blank')
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Owner
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}