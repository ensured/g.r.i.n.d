import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  angle: number;
  distance: number;
  speed: number;
};

export function ParticleSwirl({
  particleCount = 8,
  size = 4,
  color = 'rgba(255, 255, 255, 0.6)',
  speed = 0.5,
  distance = 20,
  className = ''
}: {
  particleCount?: number;
  size?: number;
  color?: string;
  speed?: number;
  distance?: number;
  className?: string;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize particles in a circle
    const initialParticles = Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      return {
        id: i,
        x: 0,
        y: 0,
        size: size * (0.7 + Math.random() * 0.6), // Random size variation
        opacity: 0.3 + Math.random() * 0.5, // Random opacity
        angle: angle,
        distance: distance * (0.8 + Math.random() * 0.4), // Random distance from center
        speed: speed * (0.5 + Math.random() * 0.5), // Random speed
      };
    });

    setParticles(initialParticles);
  }, [particleCount, size, speed, distance]);

  // Update particle positions in an animation frame loop
  useEffect(() => {
    if (particles.length === 0) return;

    let animationFrameId: number;
    let lastTime = 0;

    const updateParticles = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      setParticles(prevParticles =>
        prevParticles.map(particle => {
          // Move particles in a circular path
          const newAngle = particle.angle + (particle.speed * deltaTime * 0.01);
          return {
            ...particle,
            angle: newAngle,
            x: Math.cos(newAngle) * particle.distance,
            y: Math.sin(newAngle) * particle.distance,
          };
        })
      );

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    animationFrameId = requestAnimationFrame(updateParticles);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [particles.length]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateZ(0)'
      }}
      aria-hidden="true"
    >
      {particles.map((particle) => {
        // Calculate position with better distribution
        const baseX = 50; // Center X
        const baseY = 50; // Center Y
        const offsetX = Math.cos(particle.angle) * particle.distance;
        const offsetY = Math.sin(particle.angle) * particle.distance;

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${baseX}%`,
              top: `${baseY}%`,
              x: offsetX,
              y: offsetY,
              opacity: particle.opacity,
              backgroundColor: color,
              scale: 0.7 + Math.sin(particle.angle) * 0.3,
              willChange: 'transform, opacity',
              transformOrigin: 'center center',
            }}
            transition={{
              type: 'spring',
              damping: 10,
              stiffness: 50,
            }}
          />
        );
      })}
    </div>
  );
}
