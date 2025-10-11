"use client"

import { useState } from 'react'
import Image from 'next/image'
import { X, AlertTriangle, Shield } from 'lucide-react'

interface FraudAlertPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isEnquiry?: boolean
}

export default function FraudAlertPopup({ isOpen, onClose, onConfirm, isEnquiry = false }: FraudAlertPopupProps) {
  if (!isOpen) return null

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

        {/* Header with illustration */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-2" />
            <h2 className="text-2xl font-bold text-red-600">Fraud Alert</h2>
          </div>

          {/* Illustration placeholder */}
          <div className="relative h-40 mx-auto mb-4 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <div className="flex items-center justify-center h-full">
              <Shield className="h-16 w-16 text-red-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Warning content */}
        <div className="space-y-4 text-gray-700">
          <p className="font-medium text-center">
            {isEnquiry ? "Please verify the property before making any payments." : "Please do not pay the owner before meeting them."}
          </p>

          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-2">
              Real owners do not charge for:
            </p>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-red-600 mr-2 text-lg">×</span>
                <span className="text-sm">Gate Pass</span>
              </div>
              <div className="flex items-center">
                <span className="text-red-600 mr-2 text-lg">×</span>
                <span className="text-sm">Property Visit</span>
              </div>
              <div className="flex items-center">
                <span className="text-red-600 mr-2 text-lg">×</span>
                <span className="text-sm">Advance Payment Before Viewing</span>
              </div>
            </div>
            <p className="text-sm mt-2 text-red-700">
              If someone asks for these charges, they might be a fraudster. Please report them immediately.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-sm">
              <span className="font-medium text-yellow-800">Note:</span> StayHub does not control any external transaction. Please be cautious while making any transaction and always verify the property before payment.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Safety Tips:</span>
            </p>
            <ul className="text-sm mt-1 space-y-1 text-blue-700">
              <li>• Always visit the property before booking</li>
              <li>• Verify owner identity and documents</li>
              <li>• Use StayHub's secure payment system</li>
              <li>• Never share financial information upfront</li>
              {isEnquiry && <li>• Contact owner directly through verified channels</li>}
            </ul>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={onConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            I Understand, {isEnquiry ? "Show Owner Details" : "Continue Booking"}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}