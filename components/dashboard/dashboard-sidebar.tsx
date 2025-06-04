
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Home,
  Package,
  ClipboardCheck,
  SettingsIcon,
  Webhook,
  GanttChartSquare,
  Users2,
  Share2,
  Layers,
  PlusCircle, 
  FileSearch, 
  QrCode,     
  BookCopy,
  Code2,
  BookMarked,
  BarChart3,
  Archive,    
  Briefcase,
  DollarSign,
  ImageIcon as ImageIconLucide,
  Vote,
  ShieldAlert,
  KeyRound,
  FlaskConical,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import type { MockUser, UserRole } from '@/app/dashboard/page.tsx';

// Norruva Logo
const NorruvaLogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("h-7 w-7", className)}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M32 4C16.4317 4 4 16.4317 4 32C4 47.5683 16.4317 60 32 60C47.5683 60 60 47.5683 60 32C60 26.2437 58.1179 20.9291 54.8819 16.5M32 4L16.5 54.8819C20.9291 58.1179 26.2437 60 32 60C37.7563 60 43.0709 58.1179 47.5 54.8819L32 4Z"
      stroke="hsl(var(--primary))"
      strokeWidth="3.5"
    />
    <path
      d="M32 12L19.65 32L32 52L44.35 32L32 12Z"
      fill="hsl(var(--accent))"
      stroke="hsl(var(--accent-foreground))"
      strokeWidth="2"
    />
    <circle cx="32" cy="32" r="5.5" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--primary))" strokeWidth="2"/>
  </svg>
);


const mainNavItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/compliance', label: 'Compliance Center', icon: ClipboardCheck },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/team', label: 'Team', icon: Users2 },
];

const toolsNavItems = [
  { href: '/dashboard/products/create', label: 'Create Product', icon: PlusCircle, roles: ['manufacturer'] },
  { href: '/dashboard/verification', label: 'Verification Queue', icon: FileSearch, roles: ['verifier'] },
  { href: '/dashboard/qr-generator', label: 'QR Codes', icon: QrCode, roles: ['manufacturer'] },
  { href: '/dashboard/export', label: 'Bulk Export', icon: Archive, roles: ['manufacturer', 'admin'] },
  { href: '/dashboard/integrations', label: 'API & Integrations', icon: Share2 }, // Roles removed to make it generally available
];

const blockchainNavItems = [
    { href: '/dashboard/blockchain', label: 'Hub', icon: GanttChartSquare },
    { href: '/dashboard/blockchain/nft-gallery', label: 'NFT Gallery', icon: ImageIconLucide },
    { href: '/dashboard/blockchain/staking', label: 'Token Staking', icon: DollarSign },
    { href: '/dashboard/blockchain/governance', label: 'DAO Governance', icon: Vote },
    { href: '/dashboard/blockchain/credentials', label: 'Verifiable Credentials', icon: ShieldAlert },
    { href: '/dashboard/blockchain/dids', label: 'DID Management', icon: KeyRound },
    { href: '/dashboard/blockchain/analytics', label: 'On-Chain Analytics', icon: BarChart3 },
    { href: '/dashboard/blockchain/contracts', label: 'Smart Contracts', icon: BookCopy },
];

const developerNavItems = [
    { href: '/studio', label: 'Dev Portal Home', icon: Briefcase },
    { href: '/developer/docs', label: 'API Documentation', icon: BookCopy },
    { href: '/developer/examples', label: 'Code Examples', icon: Code2, disabled: true },
    { href: '/developer/sandbox', label: 'API Sandbox', icon: FlaskConical, disabled: true },
];

const accountNavItems = [
 { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
];


export default function DashboardSidebar() {
  const pathname = usePathname();
  const [activeUserRole, setActiveUserRole] = useState<UserRole>('manufacturer');

  const updateUserRoleFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedUserJson = sessionStorage.getItem('currentMockUser');
      if (storedUserJson) {
        try {
          const storedUser = JSON.parse(storedUserJson) as MockUser;
          const validRoles: UserRole[] = ['manufacturer', 'supplier', 'recycler', 'verifier', 'retailer'];
          if (storedUser.role && validRoles.includes(storedUser.role)) {
            setActiveUserRole(storedUser.role);
          } else {
            setActiveUserRole('manufacturer');
          }
        } catch (e) {
          console.error("Failed to parse user from session storage for sidebar:", e);
          setActiveUserRole('manufacturer');
        }
      } else {
        setActiveUserRole('manufacturer');
      }
    }
  }, []);

  useEffect(() => {
    updateUserRoleFromStorage();
    window.addEventListener('sessionStorageMockUserChanged', updateUserRoleFromStorage);
    return () => {
      window.removeEventListener('sessionStorageMockUserChanged', updateUserRoleFromStorage);
    };
  }, [updateUserRoleFromStorage]);


  const renderNavItems = (items: any[], isSubMenu: boolean = false) => {
    return items.map((item) => {
      const isVisible = item.roles ? item.roles.includes(activeUserRole) : true;
      if (!isVisible) return null;

      const isActive = item.href === '/dashboard'
        ? pathname === item.href
        : (item.href ? pathname.startsWith(item.href) : false);

      return (
        <li key={item.href || item.label}>
          <Button
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start text-sm font-medium group rounded-md transition-colors duration-150 h-10",
              isSubMenu ? "pl-8 pr-3 py-2" : "pl-3 pr-3 py-2.5", 
              isActive
                ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={item.disabled}
          >
            <Link href={item.disabled ? "#" : item.href!} className="flex items-center gap-3 w-full">
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary": "text-muted-foreground group-hover:text-foreground transition-colors duration-150")} />
              {item.label}
            </Link>
          </Button>
        </li>
      );
    });
  };
  
  const getDefaultAccordionValues = useCallback(() => {
    const values = [];
    if (toolsNavItems.some(item => item.href && pathname.startsWith(item.href) && (item.roles ? item.roles.includes(activeUserRole) : true))) {
        values.push('tools');
    }
    if (blockchainNavItems.some(item => item.href && pathname.startsWith(item.href))) {
        values.push('blockchain');
    }
    if (developerNavItems.some(item => item.href && pathname.startsWith(item.href))) {
        values.push('developer');
    }
    return values;
  }, [pathname, activeUserRole]);


  return (
    <aside className="w-64 bg-card flex flex-col border-r border-border shadow-lg overflow-y-auto">
      <div className="px-4 py-5 border-b border-border flex items-center gap-2.5 bg-primary/5">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Go to Homepage">
          <NorruvaLogoIcon />
          <h2 className="text-xl font-space-grotesk font-bold text-primary group-hover:text-primary/90 transition-colors">
            Norruva
          </h2>
        </Link>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        <ul className="space-y-0.5 mb-3">
          {renderNavItems(mainNavItems)}
        </ul>

        <Accordion type="multiple" defaultValue={getDefaultAccordionValues()} key={`accordion-${activeUserRole}-${pathname}`} className="w-full">
          {[
            { value: 'tools', trigger: 'Tools & Integrations', items: toolsNavItems, icon: SettingsIcon },
            { value: 'blockchain', trigger: 'Blockchain Features', items: blockchainNavItems, icon: GanttChartSquare },
            { value: 'developer', trigger: 'Developer Portal', items: developerNavItems, icon: Code2 },
          ].map(section => {
            const visibleItems = section.items.filter(item => item.roles ? item.roles.includes(activeUserRole) : true);
            // If the section is "tools" and we've made "API & Integrations" always visible by removing its roles,
            // visibleItems will always have at least one item for the "tools" section.
            if (visibleItems.length === 0) return null;
            const SectionIcon = section.icon;

            return (
              <AccordionItem value={section.value} key={section.value} className="border-none mb-1">
                <AccordionTrigger className="px-3 py-2.5 h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline hover:bg-muted/30 data-[state=open]:bg-muted/50 data-[state=open]:text-foreground [&>svg]:data-[state=open]:text-primary rounded-md">
                  <div className="flex flex-1 items-center gap-3"> {/* Added flex-1 here */}
                    <SectionIcon className="h-5 w-5" />
                    {section.trigger}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0.5 pb-1">
                  <ul className="space-y-0.5">
                    {renderNavItems(visibleItems, true)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="mt-3">
          <div className="px-3 pt-4 pb-2">
            <Separator />
          </div>
          <h3 className="px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </h3>
          <ul className="space-y-0.5">
            {renderNavItems(accountNavItems)}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
