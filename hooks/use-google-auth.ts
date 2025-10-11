"use client"

import { useState, useEffect } from 'react'
import { 
  signInWithPopup, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  getRedirectResult,
  User
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { toast } from 'sonner'

interface UseGoogleAuthOptions {
  onSuccess?: (user: User) => void
  onError?: (error: any) => void
  redirectOnSuccess?: string
}

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true)

  // Check for redirect result on mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result?.user) {
          options.onSuccess?.(result.user)
          if (options.redirectOnSuccess) {
            window.location.href = options.redirectOnSuccess
          }
        }
      } catch (error: any) {
        console.error('Redirect result error:', error)
        options.onError?.(error)
        toast.error('Authentication failed. Please try again.')
      } finally {
        setIsCheckingRedirect(false)
      }
    }

    checkRedirectResult()
  }, [])

  const signInWithGoogle = async () => {
    if (isLoading || isCheckingRedirect) return

    setIsLoading(true)
    const provider = new GoogleAuthProvider()
    
    // Add additional scopes if needed
    provider.addScope('email')
    provider.addScope('profile')

    try {
      // First, try popup method
      const result = await signInWithPopup(auth, provider)
      options.onSuccess?.(result.user)
      
      if (options.redirectOnSuccess) {
        window.location.href = options.redirectOnSuccess
      }
      
      return result.user
    } catch (popupError: any) {
      console.log('Popup error:', popupError.code, popupError.message)
      
      // Handle specific popup errors by falling back to redirect
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request' ||
        popupError.code === 'auth/unauthorized-domain'
      ) {
        try {
          console.log('Falling back to redirect method...')
          toast.info('Redirecting to Google for authentication...')
          
          // Use redirect as fallback
          await signInWithRedirect(auth, provider)
          // Note: This will cause a page reload, so execution stops here
        } catch (redirectError: any) {
          console.error('Redirect error:', redirectError)
          options.onError?.(redirectError)
          toast.error('Authentication failed. Please try again.')
        }
      } else {
        // Handle other errors
        console.error('Authentication error:', popupError)
        options.onError?.(popupError)
        
        // Provide user-friendly error messages
        let errorMessage = 'Authentication failed. Please try again.'
        
        switch (popupError.code) {
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.'
            break
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please wait a moment and try again.'
            break
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.'
            break
          default:
            errorMessage = popupError.message || errorMessage
        }
        
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    signInWithGoogle,
    isLoading: isLoading || isCheckingRedirect,
    isCheckingRedirect
  }
}