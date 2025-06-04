// src/components/landing/footer.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { NorruvaLogoIcon } from './norruva-logo-icon'; // Import text-based logo
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Linkedin, Twitter, Github, Youtube, Send } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerNavs = [
    {
      label: "Product",
      items: [
        { href: '#design-build', name: 'Visual Builder' },
        { href: '#verify-track', name: 'Lifecycle Tracking' },
        { href: '#analyze-optimize', name: 'Compliance AI' },
        { href: '#pricing', name: 'Pricing' },
      ],
    },
    {
      label: "Company",
      items: [
        { href: '#social-proof', name: 'About Us' }, // Changed from #company to #social-proof for now
        { href: '#', name: 'Careers (Placeholder)' },
        { href: '#contact', name: 'Contact Us' },
      ],
    },
    {
      label: "Resources",
      items: [
        { href: '/developer/docs', name: 'Developer API' },
        { href: '#', name: 'Help Center (Placeholder)' },
        { href: '#', name: 'ESPR Guide (Placeholder)' },
      ],
    },
    {
      label: "Legal",
      items: [
        { href: '#', name: 'Privacy Policy (Placeholder)' },
        { href: '#', name: 'Terms of Service (Placeholder)' },
      ],
    },
  ];

  const socialLinks = [
    { href: '#', label: 'LinkedIn', icon: Linkedin },
    { href: '#', label: 'Twitter', icon: Twitter },
    { href: '#', name: 'GitHub', icon: Github }, // Corrected: use name or label consistently
    { href: '#', name: 'YouTube', icon: Youtube }, // Corrected: use name or label consistently
  ];

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailInput = event.currentTarget.elements.namedItem('email') as HTMLInputElement;
    const email = emailInput.value;
    alert(`Thank you for subscribing with ${email}! (This is a demo)`);
    event.currentTarget.reset();
  };

  return (
    <footer className="bg-foreground text-background/70 py-16"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center mb-4 gap-2">
              <NorruvaLogoIcon className="text-primary" /> {/* Use text-based logo, apply primary color */}
            </Link>
            <p className="text-sm font-inter mb-6 max-w-md text-background/80">
              Norruva: The Visual-First Digital Product Passport Platform. Create compliance-ready product transparency without code.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mt-6 max-w-sm">
                <label htmlFor="newsletter-email" className="block text-sm font-medium text-background mb-2">Stay Updated With Norruva News</label>
                <div className="flex">
                    <Input 
                        type="email" 
                        name="email"
                        id="newsletter-email" 
                        placeholder="Enter your email" 
                        required
                        className="bg-background/10 border-background/20 text-background placeholder-background/50 rounded-r-none focus:ring-accent focus:border-accent h-11 text-sm"
                    />
                    <Button type="submit" className="bg-accent text-accent-foreground rounded-l-none hover:bg-accent/90 px-4 h-11">
                        <Send className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Subscribe</span>
                    </Button>
                </div>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2 lg:col-span-2">
            {footerNavs.map((nav) => (
              <div key={nav.label}>
                <h3 className="text-sm font-inter font-semibold text-background mb-4 tracking-wider uppercase">{nav.label}</h3>
                <ul className="space-y-3 text-sm font-inter">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-background/80 hover:text-accent transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs font-inter text-background/70">
            &copy; {currentYear} Norruva. All rights reserved.
          </p>
          <div className="flex items-center space-x-5 mt-4 md:mt-0">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link key={social.name || social.label} href={social.href} aria-label={social.name || social.label} className="text-background/70 hover:text-accent transition-colors">
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
