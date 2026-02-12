import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import NextAuthProvider from "@/components/NextAuthProvider";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'),
  title: {
    default: "Indian Kitchen - Authentic Traditional Recipes",
    template: "%s | Indian Kitchen"
  },
  description: "Discover authentic Indian recipes from every state. Explore traditional flavors, cooking tips, and AI-powered recipe generation.",
  keywords: ["Indian recipes", "traditional cooking", "Indian food", "recipe generator", "AI cooking", "authentic indian dishes"],
  authors: [{ name: "Indian Kitchen Team" }],
  creator: "Indian Kitchen",
  publisher: "Indian Kitchen",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Indian Kitchen',
    title: 'Indian Kitchen - Authentic Traditional Recipes',
    description: 'Discover authentic Indian recipes from every state. Explore traditional flavors, cooking tips, and AI-powered recipe generation.',
    images: [
      {
        url: '/assets/hero-dal.webp',
        width: 1200,
        height: 630,
        alt: 'Indian Kitchen - Authentic Recipes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Indian Kitchen - Authentic Traditional Recipes',
    description: 'Discover authentic Indian recipes from every state. Explore traditional flavors.',
    images: ['/assets/hero-dal.webp'],
    creator: '@indiankitchen',
  },
  icons: {
    icon: '/icon',
    shortcut: '/icon',
    apple: '/icon',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/#organization`,
      name: 'Indian Kitchen',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/indian-kitchen-logo.svg`,
      },
      sameAs: [
        'https://twitter.com/indiankitchen',
        'https://facebook.com/indiankitchen',
        'https://instagram.com/indiankitchen',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/#website`,
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog',
      name: 'Indian Kitchen',
      description: 'Authentic Traditional Indian Recipes',
      publisher: {
        '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-stone-50 text-gray-900 min-h-screen flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextAuthProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
