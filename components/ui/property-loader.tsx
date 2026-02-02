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
                        {/* House Icon with Pulse */}
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="z-10 text-red-600 mb-8"
                        >
                            <Home size={48} strokeWidth={1.5} />
                        </motion.div>

                        {/* Rotating Progress Circle */}
                        <div className="absolute inset-0 flex items-center justify-center -top-8">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="transparent"
                                    className="text-neutral-200"
                                />
                                <motion.circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="transparent"
                                    className="text-red-600"
                                    strokeDasharray="351.86" // 2 * pi * 56
                                    strokeDashoffset={351.86 - (351.86 * progress) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        {/* Percentage Text */}
                        <div className="absolute flex items-center justify-center top-[30px]">
                            <span className="text-xs font-bold text-neutral-400 font-mono">{progress}%</span>
                        </div>


                        {/* Optional Text */}
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 text-sm font-medium text-neutral-600 tracking-wide"
                        >
                            PROCESSING
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
