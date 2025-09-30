import { GAME_SETTINGS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface SkateLettersProps {
    letters: string[]
    className?: string
}

export function SkateLetters({ letters, className }: SkateLettersProps) {

    return (
        <div className={`flex flex-row items-center gap-1 ${className || ""}`}>
            <AnimatePresence>
                {GAME_SETTINGS.SKATE_LETTERS.map((letter, idx) => {
                    const isCollected = letters.includes(letter);
                    return (
                        <motion.div
                            key={`${letter}-${idx}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: isCollected ? 1 : 0.6,
                                y: 0,
                                transition: {
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20,
                                    delay: idx * 0.05
                                }
                            }}
                            whileHover={{
                                scale: isCollected ? 1.1 : 1.05,
                                y: -2,
                                transition: { duration: 0.2 }
                            }}
                            className={`flex items-center justify-center w-7 h-7 text-sm font-medium rounded-md transition-all ${isCollected
                                ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md shadow-purple-500/20'
                                : ''
                                }`}
                        >
                            {letter}

                        </motion.div>

                    );
                })}


            </AnimatePresence>
        </div>
    );
}