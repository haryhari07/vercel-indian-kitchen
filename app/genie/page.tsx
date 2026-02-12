import { Metadata } from 'next';
import GenieClient from './GenieClient';

export const metadata: Metadata = {
  title: 'Recipe Genie - AI Recipe Generator',
  description: 'Turn your ingredients into authentic Indian recipes with our AI-powered chef. Generate recipes or get dish suggestions instantly.',
  openGraph: {
    title: 'Recipe Genie - AI Recipe Generator | Indian Kitchen',
    description: 'Turn your ingredients into authentic Indian recipes with our AI-powered chef.',
    images: ['/assets/hero-dal.webp'], // Reusing hero image or could use a specific one
  },
  alternates: {
    canonical: '/genie',
  },
};

export default function RecipeGeniePage() {
  return <GenieClient />;
}