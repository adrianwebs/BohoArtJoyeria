'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Instagram, Truck } from 'lucide-react';

interface AnnouncementBarProps {
  text?: string;
  instagramUrl?: string;
}

export function AnnouncementBar({
  text = "✨ Envíos gratis a toda España a partir de 40€ | Diseños únicos hechos a mano con amor ✨",
  instagramUrl = "https://instagram.com/bohoart.jewelry"
}: AnnouncementBarProps) {
  return (
    <div className="bg-boho-charcoal text-boho-sand-100 text-xs py-2 px-4 font-medium transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden sm:flex items-center space-x-2 text-boho-gold">
          <Truck className="w-3.5 h-3.5" />
          <span>Envíos 24-48h disponibles</span>
        </div>

        <div className="flex-1 text-center flex items-center justify-center space-x-2">
          <Sparkles className="w-3 h-3 text-boho-gold shrink-0 animate-pulse" />
          <span className="tracking-wide">{text}</span>
        </div>

        <div className="hidden sm:flex items-center space-x-3">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-boho-gold transition-colors"
            title="Síguenos en Instagram"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>@bohoart.jewelry</span>
          </a>
        </div>
      </div>
    </div>
  );
}
