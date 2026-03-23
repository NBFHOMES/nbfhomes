"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function LoadingBar() {
    const [progress, setProgress] = React.useState(0)
    const [isVisible, setIsVisible] = React.useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

    // Start loading animation
    const startLoading = React.useCallback(() => {
        setIsVisible(true)
        setProgress(30)
        if (intervalRef.current) clearInterval(intervalRef.current)

        // Ultra smooth fast progress
        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return 90
                return prev + Math.random() * 8
            })
        }, 150)
    }, [])

    // Complete loading animation
    const completeLoading = React.useCallback(() => {
        setProgress(100)
        if (intervalRef.current) clearInterval(intervalRef.current)

        setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => setProgress(0), 300)
        }, 300)
    }, [])

    // Detect Route Changes (Completion)
    React.useEffect(() => {
        completeLoading()
    }, [pathname, searchParams, completeLoading])

    // Intercept Clicks Seamlessly
    React.useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            // Check if it's a standard left click on an anchor
            const target = e.target as HTMLElement
            const anchor = target.closest('a')

            if (anchor && anchor.href && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                const url = new URL(anchor.href)
                
                // Allow external links or same-page hashes to bypass the loader
                if (url.origin !== window.location.origin) return
                if (url.pathname === window.location.pathname && url.search === window.location.search) return

                startLoading()
            }
        }

        document.addEventListener('click', handleAnchorClick)
        return () => document.removeEventListener('click', handleAnchorClick)
    }, [startLoading])

    if (!isVisible) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[999999] h-1.5 bg-transparent pointer-events-none">
            <div
                className="h-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.9)] transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
