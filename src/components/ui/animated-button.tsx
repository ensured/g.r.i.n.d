import { motion } from "framer-motion";
import { Button } from "./button";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ParticleSwirl } from "./particles";

export function AnimatedButton({
  children,
  className,
  animate = true,
  showParticles = true,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  animate?: boolean;
  showParticles?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  return (
    <div className="relative inline-block w-full group/button">
      <Button
        className={cn(
          " relative z-10 w-full overflow-visible border-0 transition-all duration-300 hover:scale-[1.02]",
          className
        )}
        style={{
          position: 'relative',
          isolation: 'isolate',
          boxShadow: 'none',
        }}
        {...props}
      >
        <motion.span
          className="relative z-10 block"
          animate={{
            rotate: [0, -4, 2, -1, 0],
          }}
          transition={{
            duration: 3,
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          {children}
        </motion.span>

        {showParticles && (
          <div className="absolute inset-0 -z-10 opacity-70 overflow-visible">
            <ParticleSwirl
              particleCount={16}
              size={2}
              color="hsl(180, 80%, 45%)"
              speed={0.15}
              distance={40}
              className="w-full h-full"
            />
          </div>
        )}
        {animate && (
          <motion.span
            className="absolute inset-0 rounded-md -z-10"
            style={{
              background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
              padding: '2px',
              filter: 'blur(0.5px)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              opacity: 0.9,
            }}
            initial={{ opacity: 0.7 }}
            animate={{
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        )}
      </Button>
    </div>
  );
}
