// /src/app/developer/docs/page.tsx
"use client";

import ApiDocumentationRenderer from '@/components/developer/ApiDocumentationRenderer';
import AppHeader from '@/components/layout/app-header';
import { useState, useEffect } from 'react';

export default function DeveloperApiDocsPage() {
  // Mock environment state for the renderer, as it might expect it
  const [currentEnv, setCurrentEnv] = useState<'development' | 'staging' | 'production'>('development');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            {/* You can use a more sophisticated loader here */}
            <p>Loading API Documentation...</p>
        </div>
    );
  }

  return (
    <div>
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <ApiDocumentationRenderer currentEnv={currentEnv} />
      </main>
    </div>
  );
}
