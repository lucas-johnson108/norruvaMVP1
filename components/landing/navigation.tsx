// src/components/landing/navigation.tsx
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NorruvaLogoIcon } from './norruva-logo-icon'; // Import the text-based logo

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#design-build", label: "Design" },
    { href: "#verify-track", label: "Verify & Track" },
    { href: "#analyze-optimize", label: "Analyze" },
    { href: "#scale-collaborate", label: "Scale" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav className="bg-card shadow-subtle sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              {/* Using the text-based logo component */}
              <NorruvaLogoIcon className="text-primary" /> 
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <a 
                key={link.label} 
                href={link.href} 
                className="font-inter text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" className="font-inter text-foreground hover:text-primary hover:bg-primary/10 px-4 py-2 text-sm" asChild>
              <Link href="/app">Login</Link>
            </Button>
            <Button 
              className="font-inter bg-accent text-accent-foreground hover:bg-accent/90 px-5 py-2.5 text-sm shadow-medium"
              asChild
            >
              <Link href="/app">Start Free</Link>
            </Button>
          </div>

          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-foreground hover:text-primary hover:bg-primary/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out bg-card border-r",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex justify-between items-center h-20 px-4 border-b">
            <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
              <NorruvaLogoIcon className="text-primary" />
            </Link>
            <Button 
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="text-foreground hover:text-primary"
            aria-label="Close menu"
          >
            <X className="h-6 w-6"/>
          </Button>
        </div>
        <div className="px-4 pt-4 pb-3 space-y-2">
          {navLinks.map(link => (
          <a 
            key={link.label} 
            href={link.href} 
            onClick={() => setMobileMenuOpen(false)} 
            className="block px-3 py-3 rounded-md font-inter text-base text-foreground hover:text-primary hover:bg-primary/10"
          >
            {link.label}
          </a>
          ))}
          <div className="pt-4 border-t space-y-3">
            <Button variant="ghost" className="w-full justify-start px-3 py-3 font-inter text-base text-foreground hover:text-primary hover:bg-primary/10" asChild>
              <Link href="/app" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            </Button>
            <Button className="w-full justify-center mt-2 font-inter text-base bg-accent text-accent-foreground hover:bg-accent/90 shadow-md py-3" asChild>
              <Link href="/app" onClick={() => setMobileMenuOpen(false)}>Start Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
