import React, { useEffect, useRef } from 'react';

const STAR_COUNT = 40;
const STAR_COLORS = ['#fff', '#ffe066', '#a259f7', '#b3e6ff'];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

export default function AnimatedStars() {
  const stars = useRef([]);
  if (stars.current.length !== STAR_COUNT) {
    stars.current = Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      x: random(0, 100),
      y: random(0, 100),
      size: random(1, 2.5),
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      duration: random(8, 20),
      delay: random(0, 10),
      twinkle: random(1, 2)
    }));
  }
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" style={{ background: 'rgba(16,16,20,0.98)' }}>
      {stars.current.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full animate-star-move"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size * 2.5}px`,
            height: `${star.size * 2.5}px`,
            background: star.color,
            opacity: 0.85,
            filter: 'blur(0.5px)',
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            animationName: 'star-move',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            boxShadow: `0 0 6px 2px ${star.color}`,
          }}
        >
          <div
            className="w-full h-full rounded-full animate-star-twinkle"
            style={{
              animationDuration: `${star.twinkle}s`,
              animationDelay: `${star.delay / 2}s`,
              animationName: 'star-twinkle',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes star-move {
          0% { transform: translateY(0); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(40vh); opacity: 0.2; }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
} 