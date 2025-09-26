import { motion } from "framer-motion";

export function TitleSlide() {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        transition: { 
          type: "spring", 
          stiffness: 100,
          damping: 15,
          delay: 0.3
        }
      }}
      exit={{ 
        y: -100, 
        opacity: 0,
        transition: { 
          type: "spring", 
          stiffness: 100,
          damping: 20
        }
      }}
      className="w-full text-center mb-2 sm:mb-4"
    >
      <motion.h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent mb-1 sm:mb-2">
        S.K.A.T.E
      </motion.h1>
      <motion.p className="text-muted-foreground text-sm sm:text-base md:text-lg">
        The ultimate trick-based elimination game
      </motion.p>
    </motion.div>
  );
}
