"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useLoader } from "@/context/loader-context"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin } from "lucide-react"

export function GlobalLoader() {
    const [progress, setProgress] = React.useState(0)
    const [isVisible, setIsVisible] = React.useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { isLoading, hideLoader } = useLoader()

    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
    const completionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = React.useRef<number>(0)
    const minDisplayTime = 2000 // 2 seconds minimum

    // Start loading animation
    const startLoading = React.useCallback(() => {
        // Cancel any pending completion to keep loader active
        if (completionTimeoutRef.current) {
            clearTimeout(completionTimeoutRef.current)
            completionTimeoutRef.current = null
        }

        if (isVisible) {
            // If we re-trigger while visible (e.g. navigation finished but data fetch started)
            // Ensure we look like we are loading again
            if (progress >= 100) setProgress(30)

            // Ensure interval is running
            if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 95) return 95
                        return prev + Math.random() * 15
                    })
                }, 200)
            }
            return
        }

        setIsVisible(true)
        setProgress(0)
        startTimeRef.current = Date.now()

        if (intervalRef.current) clearInterval(intervalRef.current)

        // Progress simulation
        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return 95
                return prev + Math.random() * 15
            })
        }, 200)
    }, [isVisible, progress])

    // Complete loading animation
    const completeLoading = React.useCallback(() => {
        const elapsed = Date.now() - startTimeRef.current
        const remainingTime = Math.max(0, minDisplayTime - elapsed)

        // Clear previous timeout just in case
        if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current)

        completionTimeoutRef.current = setTimeout(() => {
            setProgress(100)
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }

            completionTimeoutRef.current = setTimeout(() => {
                setIsVisible(false)
                setProgress(0)
                completionTimeoutRef.current = null
            }, 500) // Delay to show completion state
        }, remainingTime)
    }, [])

    // 1. Context Trigger
    React.useEffect(() => {
        if (isLoading) {
            startLoading()
        } else {
            if (isVisible) completeLoading()
        }
    }, [isLoading, startLoading, completeLoading, isVisible])

    // 2. Navigation Trigger
    React.useEffect(() => {
        if (isVisible) {
            completeLoading()
        }
        // Sync context
        if (isLoading) {
            hideLoader()
        }
    }, [pathname, searchParams, completeLoading, isLoading, hideLoader])

    // 3. Global Click Listener
    React.useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const anchor = target.closest('a')
            const button = target.closest('button')

            if (anchor || button) {
                if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
                startLoading()
            }
        }
        document.addEventListener('click', handleGlobalClick, { capture: true })
        return () => document.removeEventListener('click', handleGlobalClick, { capture: true })
    }, [startLoading])

    // Exclude Admin Panel from Global Loader (keep default admin loading)
    if (pathname?.startsWith('/admin')) return null

    // House Path (Simple)
    const housePath = "M 20 50 L 50 20 L 80 50 V 85 H 20 Z"

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-sm"
                >
                    <div className="relative flex flex-col items-center justify-center">
                        <div className="relative w-32 h-32 flex items-center justify-center">

                            {/* 1. House Outline (Stroke) */}
                            <svg className="w-full h-full text-neutral-300" viewBox="0 0 100 100">
                                <path
                                    d={housePath}
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            {/* 2. House Fill (Animated by Height) */}
                            <div className="absolute inset-0 overflow-hidden flex items-end justify-center w-full h-full">
                                <motion.div
                                    className="relative w-full h-full"
                                    initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
                                    animate={{
                                        clipPath: `polygon(0 ${100 - progress}%, 100% ${100 - progress}%, 100% 100%, 0 100%)`
                                    }}
                                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                >
                                    <svg className="w-full h-full text-red-600 drop-shadow-xl" viewBox="0 0 100 100">
                                        <path
                                            d={housePath}
                                            stroke="none"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </motion.div>
                            </div>

                            {/* 3. Glowing Pin at 100% */}
                            {progress === 100 && (
                                <motion.div
                                    initial={{ scale: 0, y: 10, opacity: 0 }}
                                    animate={{ scale: 1, y: -45, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                >
                                    <div className="relative">
                                        <MapPin className="w-10 h-10 text-red-600 fill-red-100" />
                                        <div className="absolute inset-0 bg-red-400 rounded-full blur-lg opacity-50 animate-pulse" />
                                    </div>
                                </motion.div>
                            )}

                        </div>

                        {/* Text */}
                        <div className="mt-2 text-center">
                            <span className="text-2xl font-bold text-red-600 font-serif">
                                {Math.round(progress)}%
                            </span>
                            <p className="text-sm font-medium text-neutral-600 mt-2 font-serif">
                                NBF Homes.in
                            </p>
                            <p className="text-xs text-neutral-400 animate-pulse">
                                Please wait...
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
