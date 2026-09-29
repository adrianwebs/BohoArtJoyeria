'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from './AnnouncementBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { Category } from '@/lib/types';

interface StoreLayoutWrapperProps {
  children: React.ReactNode;
  announcementText: string;
  instagramUrl: string;
  categories: Category[];
  collections?: { name: string; slug: string }[];
}

export function StoreLayoutWrapper({
  children,
  announcementText,
  instagramUrl,
  categories,
  collections = [],
}: StoreLayoutWrapperProps) {
  const pathname = usePathname();

  // If the path is admin, login, or maintenance, do NOT render store header/footer/cart
  const isExcluded =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/mantenimiento');

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar
        text={announcementText}
        instagramUrl={instagramUrl}
      />
      <Navbar categories={categories} collections={collections} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
