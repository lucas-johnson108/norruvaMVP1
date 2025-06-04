
// src/components/landing/cta-section.tsx
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground"> {/* Use primary bg, primary-foreground text */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Zap className="h-12 w-12 text-accent mx-auto mb-6" /> {/* Accent color for icon */}
        <h2 className="text-3xl md:text-5xl font-space-grotesk font-bold text-primary-foreground mb-6"> {/* Font & Color */}
          Ready to Visualize Your Product Passports?
        </h2>
        <p className="text-xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto font-inter"> {/* Color */}
          Join Norruva and transform your approach to product transparency and compliance. Start building visually, today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="font-inter bg-accent text-accent-foreground font-semibold text-base hover:bg-accent/90 shadow-strong px-10 py-3" /* Accent for primary CTA */
            asChild
          >
            <Link href="/app">Start Building Free</Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="font-inter border-2 border-accent text-accent font-semibold text-base hover:bg-accent hover:text-accent-foreground px-10 py-3 shadow-medium" /* Accent outline for secondary */
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
