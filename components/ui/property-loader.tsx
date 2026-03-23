'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';
import { useLoader } from '@/context/loader-context';

export function PropertyLoader() {
    const { isLoading } = useLoader();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) return 0;
                    return prev + 1;
                });
            }, 30); // Approx 3 seconds for full cycle, loops if loading persists
        } else {
            setProgress(100);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-md"
                >
                    <div className="relative flex flex-col items-center justify-center">
                        
                        {/* Main Loader Container */}
                        <div className="relative flex flex-col items-center justify-center w-36 h-36">
                            
                            {/* Rotating Progress Circle */}
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-sm">
                                <circle
                                    cx="72"
                                    cy="72"
                                    r="64"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="transparent"
                                    className="text-neutral-100"
                                />
                                <motion.circle
                                    cx="72"
                                    cy="72"
                                    r="64"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="transparent"
                                    className="text-red-500"
                                    strokeDasharray="402.12" // 2 * pi * 64
                                    strokeDashoffset={402.12 - (402.12 * progress) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Inner Content (Icon + Percentage) perfectly centered */}
                            <div className="flex flex-col items-center justify-center z-10 w-full">
                                <motion.div
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="text-red-500 mb-1"
                                >
                                    <Home size={32} strokeWidth={1.5} />
                                </motion.div>
                                <span className="text-sm font-bold text-neutral-800 font-mono tracking-wider">
                                    {progress}%
                                </span>
                            </div>
                        </div>

                        {/* Optional Text */}
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-6 text-xs font-semibold text-neutral-500 tracking-[0.2em] uppercase"
                        >
                            Loading
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
