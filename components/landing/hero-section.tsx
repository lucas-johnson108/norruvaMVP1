
// src/components/landing/hero-section.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="bg-background py-20 md:py-32"> {/* Changed to bg-background (light grey) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-space-grotesk font-bold text-foreground mb-6 leading-tight"> {/* Changed font & color */}
            Build Digital Product Passports Visually
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto font-inter"> {/* Changed color */}
            The first visual DPP platform. Create compliance-ready product transparency without code.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="font-inter bg-accent text-accent-foreground hover:bg-accent/90 shadow-medium text-base px-8 py-3" /* Accent for primary CTA */
              asChild
            >
              <Link href="/app">Start Building Free</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" /* Use outline for secondary CTA */
              className="font-inter text-primary border-primary hover:bg-primary/10 hover:text-primary text-base px-8 py-3" /* Primary for secondary */
            >
              Watch Demo
            </Button>
          </div>
        </div>
        
        <div className="mt-16 relative">
          <Image 
            src="https://placehold.co/1200x600.png"
            alt="Clean interface mockup showing DPP creation process" 
            width={1200} 
            height={600} 
            className="rounded-xl shadow-strong object-cover mx-auto border" /* Added border for definition on light bg */
            data-ai-hint="clean dpp interface mockup visual builder"
            priority
          />
        </div>
      </div>
    </section>
  );
}
