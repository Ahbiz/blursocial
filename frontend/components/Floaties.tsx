"use client";
import { useEffect, useState } from "react";

export default function FloatingDots() {
  const [dots, setDots] = useState<{ id: number; left: string; size: string; duration: string; delay: string }[]>([]);

  useEffect(() => {
    const newDots = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 5 + 3}px`,
      duration: `${Math.random() * 10 + 10}s`, // Slow move looks better
      delay: `${Math.random() * -20}s`, // Negative delay starts them mid-air
    }));
    setDots(newDots);
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden pointer-events-none z-[1]">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="particle"
          style={{
            left: dot.left,
            width: dot.size,
            height: dot.size,
            animationDuration: dot.duration,
            animationDelay: dot.delay,
            backgroundColor: 'var(--accent-tertiary, #db2777)',
            boxShadow: '0 0 10px var(--accent-tertiary, #db2777)',
          }}
        />
      ))}
    </div>
  );
}