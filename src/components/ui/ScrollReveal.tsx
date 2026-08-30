'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // in ms, e.g. 100, 200
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  duration?: number; // in ms, default 600
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 600,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return 'translateY(28px)';
      case 'down':
        return 'translateY(-28px)';
      case 'left':
        return 'translateX(28px)';
      case 'right':
        return 'translateX(-28px)';
      case 'fade':
      default:
        return 'translateY(0)';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transform: isVisible ? 'translate(0, 0)' : getInitialTransform(),
        opacity: isVisible ? 1 : 0,
      }}
      className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
