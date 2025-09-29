'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SkateboardAnimation() {
    const [showSkateboard, setShowSkateboard] = useState(false);

    useEffect(() => {
        // Initial delay of 5 seconds before first animation
        const initialTimer = setTimeout(() => {
            setShowSkateboard(true);
        }, 1500);

        // Set up interval for subsequent animations
        const interval = setInterval(() => {
            setShowSkateboard(true);
            // Animation duration is 3 seconds, so we'll hide it after that
            setTimeout(() => setShowSkateboard(false), 3000);
        }, 10300); // 30 seconds

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="fixed bottom-4 left-0 right-0 h-12 pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {showSkateboard && (
                    <motion.span
                        initial={{ x: '-10%', rotate: 0 }}
                        animate={{
                            x: '100vw',
                            rotate: 45,
                            transition: {
                                x: {
                                    duration: 2.5,
                                    ease: "linear"
                                },
                                rotate: {
                                    duration: 0.25,
                                }
                            }
                        }}
                        exit={{ x: '100vw' }}
                        style={{
                            position: 'absolute',
                            bottom: '1rem',
                            left: 0,
                            fontSize: '2rem',
                            display: 'inline-block',
                            transformOrigin: 'center center',
                            willChange: 'transform'
                        }}
                        onAnimationComplete={() => setShowSkateboard(false)}
                    >
                        🛹
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
