'use client';

import React, { useEffect, useState } from 'react';

function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    done: diff === 0,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** Live countdown to an ISO date. Renders nothing until mounted to avoid hydration mismatches. */
export function Countdown({ target, label }: { target: string; label: string }) {
  const targetMs = new Date(target).getTime();
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    setTime(remaining(targetMs));
    const t = setInterval(() => setTime(remaining(targetMs)), 1000);
    return () => clearInterval(t);
  }, [targetMs]);

  if (!time || time.done) return null;

  const cells: [number, string][] = [
    [time.days, 'días'],
    [time.hours, 'horas'],
    [time.minutes, 'min'],
    [time.seconds, 'seg'],
  ];

  return (
    <div className="inline-block">
      <p className="text-[11px] font-bold uppercase tracking-widest text-white/85 mb-2">{label}</p>
      <div className="flex gap-2 sm:gap-3">
        {cells.map(([value, unit]) => (
          <div key={unit} className="min-w-[3.6rem] rounded-2xl bg-white/15 backdrop-blur px-3 py-2 text-center border border-white/25">
            <div className="font-serif-boho text-2xl sm:text-3xl font-bold text-white tabular-nums">
              {String(value).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/80">{unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
