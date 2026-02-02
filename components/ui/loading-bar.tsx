"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useLoader } from "@/context/loader-context"

export function LoadingBar() {
    const [progress, setProgress] = React.useState(0)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { isLoading } = useLoader()
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

    // Start loading animation
    const startLoading = React.useCallback(() => {
        setProgress(30)
        if (intervalRef.current) clearInterval(intervalRef.current)

        // Slow progress to 90%
        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return 90
                return prev + Math.random() * 10
            })
        }, 500)
    }, [])

    // Complete loading animation
    const completeLoading = React.useCallback(() => {
        setProgress(100)
        if (intervalRef.current) clearInterval(intervalRef.current)

        setTimeout(() => {
            setProgress(0)
        }, 500)
    }, [])

    // Listen to manual context trigger
    React.useEffect(() => {
        if (isLoading) {
            startLoading()
        } else {
            // Only complete if we are not navigating (pathname check handles navigation completion)
            // But if context explicitly says hide, we should likely respect it or let pathname handle it.
            // For now, let's treat context false as "request to stop" but if navigation is pending...
            // Actually, simplest is: context true = force load. context false = do nothing (let nav handle it) or stop?
            // Let's assume context is for API calls.
            if (progress > 0 && progress < 100) {
                completeLoading()
            }
        }
    }, [isLoading, startLoading, completeLoading])

    // Detect Route Changes (Completion)
    React.useEffect(() => {
        completeLoading()
    }, [pathname, searchParams, completeLoading])

    // Intercept Clicks and History
    React.useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            if (e.defaultPrevented) return
            const target = e.target as HTMLElement
            const anchor = target.closest('a')

            if (anchor && anchor.href && !anchor.target && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                const url = new URL(anchor.href)
                if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
                    startLoading()
                }
            }
        }

        // Monkey patch history not strictly needed if we catch clicks, 
        // but useful for router.push if not triggered by click.
        // Doing full history patch is risky in React 18/Next 14 concurrent mode.
        // Safer to just stick to Anchor clicks + Context manual trigger.

        document.addEventListener('click', handleAnchorClick)
        return () => document.removeEventListener('click', handleAnchorClick)
    }, [startLoading])

    if (progress === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none">
            <div
                className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.7)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
