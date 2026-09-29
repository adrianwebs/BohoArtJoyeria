import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cartContext';
import { Preloader } from '@/components/ui/Preloader';
import { StoreLayoutWrapper } from '@/components/layout/StoreLayoutWrapper';
import { storeService } from '@/lib/storeService';

// Data comes from the database at request time; never prerender at build (no DB inside the Docker build).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bohoartjoyeria.com'),
  title: {
    default: 'Bohoart Jewelry | Joyería Artesanal en Arcilla Polimérica',
    template: '%s | Bohoart Jewelry',
  },
  description: 'Descubre piezas únicas de joyería artesanal moldeadas a mano en arcilla polimérica. Pendientes ultraligeros, hipoalergénicos y diseños bohemios con envíos a toda España.',
  keywords: [
    'joyería artesanal',
    'arcilla polimérica',
    'pendientes arcilla polimérica',
    'joyería boho',
    'pendientes ligeros',
    'joyas hechas a mano',
    'bohoart jewelry',
    'pendientes artesanales',
  ],
  authors: [{ name: 'Bohoart Jewelry' }],
  creator: 'Bohoart Jewelry',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://bohoartjoyeria.com',
    siteName: 'Bohoart Jewelry',
    title: 'Bohoart Jewelry | Joyería Artesanal en Arcilla Polimérica',
    description: 'Diseños únicos creados a mano con amor y detalle. Joyería ultraligera y elegante en arcilla polimérica.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Bohoart Jewelry Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bohoart Jewelry | Joyería Artesanal',
    description: 'Diseños únicos creados a mano en arcilla polimérica.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await storeService.getSettings();
  const categories = await storeService.getCategories();
  const liveCollections = (await storeService.getCollections())
    .filter((c) => c.status === 'live')
    .map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <html lang="es" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-boho-linen text-boho-charcoal selection:bg-boho-terracotta selection:text-white">
        <Preloader />
        <CartProvider>
          <StoreLayoutWrapper
            announcementText={settings.announcementText}
            instagramUrl={settings.instagramUrl}
            categories={categories}
            collections={liveCollections}
          >
            {children}
          </StoreLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
