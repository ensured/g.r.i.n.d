import { motion, AnimatePresence } from 'framer-motion';

interface SkateLettersProps {
    letters: string[]
    className?: string
}

export function SkateLetters({ letters, className }: SkateLettersProps) {
    return (
        <div className={`flex items-center gap-1 ${className || ""}`}>
            <AnimatePresence mode="popLayout">
                {letters.map((letter, idx) => (
                    <motion.div
                        key={`${letter}-${idx}`}
                        layout
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ 
                            scale: 1, 
                            opacity: 1, 
                            y: 0,
                            transition: { 
                                type: 'spring',
                                stiffness: 500,
                                damping: 30
                            }
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ 
                            scale: 1.2, 
                            rotate: [0, -10, 10, 0],
                            transition: { duration: 0.3 }
                        }}
                        className="flex items-center justify-center w-5 h-5 text-xs font-bold rounded-md bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 border border-slate-300 shadow-sm"
                    >
                        {letter}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export function isSkateComplete(letters: string[]): boolean {
    const skateLetters = ["G", "R", "I", "N", "D"]
    return skateLetters.every((letter) => letters.includes(letter))
}

export function getMissingLetters(letters: string[]): string[] {
    const skateLetters = ["G", "R", "I", "N", "D"]
    return skateLetters.filter((letter) => !letters.includes(letter))
}
