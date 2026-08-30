'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Check session storage to only show once per session if preferred,
    // or let it provide a smooth ~1.2s entrance.
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 150);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => {
          setShouldRender(false);
        }, 700); // Allow fade-out transition to complete
      }, 300);
    }, 1100);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF6F0] transition-all duration-700 ease-in-out ${
        loading ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
      }`}
      aria-hidden={!loading}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-boho-terracotta/10 blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-boho-gold/15 blur-3xl pointer-events-none animate-float-reverse" />

      <div className="relative flex flex-col items-center text-center px-6 max-w-sm">
        {/* Center Logo with Animated Spinning Halo */}
        <div className="relative mb-6">
          {/* Outer rotating decorative ring */}
          <div className="absolute -inset-3 rounded-full border border-dashed border-boho-terracotta/40 animate-[spin_12s_linear_infinite]" />
          
          {/* Inner pulsing glow halo */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-boho-terracotta/30 to-boho-gold/30 blur-sm animate-pulse-subtle" />

          {/* Logo container */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-boho-terracotta bg-white p-1 shadow-elevated">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/logo.png"
                alt="Bohoart Jewelry"
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Sparkle badge */}
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 border border-boho-gold/40 shadow-sm animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-boho-gold fill-boho-gold" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold tracking-widest text-boho-charcoal mb-1">
          BOHO ART
        </h1>
        <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-boho-charcoal-muted font-sans font-medium mb-6">
          Joyería Artesanal • Arcilla Polimérica
        </p>

        {/* Delicate Progress Bar */}
        <div className="w-48 bg-boho-sand-300/80 h-1.5 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="bg-gradient-to-r from-boho-gold to-boho-terracotta h-full rounded-full transition-all duration-300 ease-out shimmer-mask"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Micro status text */}
        <span className="text-[10px] text-boho-charcoal-muted/80 mt-2.5 font-mono">
          Moldeando piezas únicas...
        </span>
      </div>
    </div>
  );
}
