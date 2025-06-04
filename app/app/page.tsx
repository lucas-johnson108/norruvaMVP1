// src/app/app/page.tsx
"use client"; // NorruvaApp uses client features
import NorruvaApp from '@/components/ecopass-app/main';

// Note: Metadata object is typically for server components or page files that Next.js can statically analyze.
// For a page that's entirely client-rendered like this, setting title via document.title in useEffect within NorruvaApp might be an option if needed.

export default function ApplicationPage() {
  return <NorruvaApp />;
}
