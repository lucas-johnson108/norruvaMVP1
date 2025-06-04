// src/components/landing/PlatformInActionSection.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  QrCode,
  ShieldCheck,
  GitBranch,
  Globe,
  DollarSign,
  Repeat,
  CheckCircle,
  Activity,
  BarChart3,
  ImageIcon as ImageIconLucide,
  Link as LinkIconLucide,
  LayoutDashboard,
  Database,
  Users,
  CalendarCheck2,
  FileText,
  Sparkles
} from 'lucide-react';
import React, { useState, useEffect } from 'react'; // Added useEffect and useState

const DashboardMetricCard = ({ icon, value, label, unit }: { icon: React.ReactNode; value: string; label: string; unit?: string }) => (
  <Card className="bg-card/80 shadow-subtle border-border/50 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</CardTitle>
      <div className="text-primary">{icon}</div>
    </CardHeader>
    <CardContent className="pb-4 px-4">
      <div className="text-2xl font-bold text-foreground">{value}{unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}</div>
    </CardContent>
  </Card>
);

const JourneyStep = ({ icon, title, detail, status, statusColor }: { icon: React.ReactNode; title: string; detail: string; status?: string; statusColor?: string }) => (
  <li className="flex items-start space-x-3 pb-4 relative">
    <div className="absolute left-3 top-8 w-0.5 h-full bg-border -translate-x-1/2"></div> {/* Vertical line */}
    <div className="flex-shrink-0 z-10">
      <div className="bg-primary/10 text-primary p-2 rounded-full">
        {icon}
      </div>
    </div>
    <div>
      <h4 className="text-md font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground">{detail}</p>
      {status && <Badge variant="outline" className={`mt-1 text-xs ${statusColor || 'border-muted-foreground text-muted-foreground'}`}>{status}</Badge>}
    </div>
  </li>
);

export default function PlatformInActionSection() {
  const [dashboardMetrics, setDashboardMetrics] = useState([
    { icon: <Package className="h-5 w-5" />, value: "2,847", label: "Active DPPs" },
    { icon: <QrCode className="h-5 w-5" />, value: "45,291", label: "QR Scans Today" },
    { icon: <ShieldCheck className="h-5 w-5" />, value: "98.7", label: "EBSI Verified", unit: "%" },
    { icon: <GitBranch className="h-5 w-5" />, value: "1,203", label: "Blockchain TXs" },
    { icon: <Globe className="h-5 w-5" />, value: "147", label: "Countries Active" },
    { icon: <DollarSign className="h-5 w-5" />, value: "847K", label: "NORU Staked" },
  ]);

  useEffect(() => {
    // Simulate dynamic-looking data for dashboard metrics on mount
    setDashboardMetrics(prevMetrics => prevMetrics.map(metric => {
      let numericValuePart = metric.value.replace(/[^\d.]/g, '');
      let baseValue = parseFloat(numericValuePart);
      if (isNaN(baseValue)) baseValue = 1000; // Default if parsing fails

      let newValue;
      if (metric.label === "Active DPPs") newValue = Math.floor(baseValue + Math.random() * 50 - 25);
      else if (metric.label === "QR Scans Today") newValue = Math.floor(baseValue + Math.random() * 500 - 250);
      else if (metric.label === "EBSI Verified") newValue = (Math.min(100, Math.max(95, baseValue + Math.random() * 2 - 1))).toFixed(1);
      else if (metric.label === "Blockchain TXs") newValue = Math.floor(baseValue + Math.random() * 100 - 50);
      else if (metric.label === "Countries Active") newValue = Math.floor(baseValue + Math.random() * 5 - 2);
      else if (metric.label === "NORU Staked") newValue = Math.floor(baseValue + Math.random() * 10000 - 5000);
      else newValue = baseValue;
      
      // Ensure values don't go below a reasonable minimum
      if (typeof newValue === 'number' && newValue < 0 && metric.label !== "EBSI Verified" && metric.label !== "NORU Staked") newValue = Math.max(0, newValue);
      if (metric.label === "NORU Staked" && typeof newValue === 'number') newValue = Math.max(100000, newValue);


      return {
        ...metric,
        value: typeof newValue === 'number' ? newValue.toLocaleString('en-US', { maximumFractionDigits: metric.unit === "%" ? 1 : 0 }) : metric.value,
      };
    }));
  }, []);

  const productJourney = [
    { icon: <Package className="h-5 w-5" />, title: "Product Definition", detail: "Eco Cotton T-Shirt (#GTI123456789) created in Firebase DB with core attributes, materials list, and sustainability goals. ESPR schema applied." },
    { icon: <Database className="h-5 w-5" />, title: "Data Enrichment", detail: "Supplier data for organic cotton batch #XYZ789 integrated. CO2 footprint calculated: 5.2 kgCO2e." },
    { icon: <QrCode className="h-5 w-5" />, title: "QR & Digital Link", detail: "GS1 Digital Link generated and activated for consumer & B2B access. QR code ready for packaging." },
    { icon: <Sparkles className="h-5 w-5" />, title: "AI Compliance Check", detail: "Product data auto-validated against EU Textile Strategy & GOTS. Status: Compliant." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "EBSI Credential Issued", detail: "Verifiable Credential (VC) for GOTS compliance issued via EBSI. CredID: vc-gots-001-textile." },
    { icon: <ImageIconLucide className="h-5 w-5" />, title: "DPP NFT Minted", detail: "Unique NFT representing the DPP minted on Polygon. Token ID: #2847. Metadata linked to VC & public data." },
    { icon: <CalendarCheck2 className="h-5 w-5" />, title: "Lifecycle Event: Shipped", detail: "Product shipped to retailer 'GreenStyle Boutique'. Event recorded in DPP." },
    { icon: <BarChart3 className="h-5 w-5" />, title: "Consumer Scan & Analytics", detail: "First consumer QR scan recorded in Paris, FR. Analytics dashboard live with 1,247 total scans." },
  ];

  return (
    <section id="platform-in-action" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-foreground mb-4">
            Norruva in Action: Your Integrated DPP Hub
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Experience the power of connected product data, from creation to consumer interaction and compliance.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Dashboard Mockup Card */}
          <Card className="lg:col-span-3 bg-card shadow-strong border border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="font-space-grotesk text-lg text-foreground flex items-center">
                  <LayoutDashboard className="h-5 w-5 mr-2 text-primary" />Norruva Hub - Digital Product Passport Platform
                </CardTitle>
                <Badge variant="default" className="bg-accent text-accent-foreground text-xs">
                  <CheckCircle className="h-3 w-3 mr-1.5" />All Systems Operational (Live)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {dashboardMetrics.map(metric => (
                  <DashboardMetricCard key={metric.label} {...metric} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Product Journey Tracking Card */}
          <Card className="lg:col-span-2 bg-card shadow-strong border border-border/50">
            <CardHeader className="bg-muted/30 p-4 border-b border-border/50">
              <CardTitle className="font-space-grotesk text-lg text-foreground flex items-center">
                <Repeat className="h-5 w-5 mr-2 text-primary" />Live Product Journey Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="mb-3">
                <h3 className="text-md font-semibold text-foreground">Product: Eco Cotton T-Shirt #GTI123456789</h3>
                <Badge variant="default" className="bg-accent text-accent-foreground mt-1">
                  <CheckCircle className="h-3 w-3 mr-1.5" />Fully Verified & Tracked
                </Badge>
              </div>
              <ul className="relative"> {/* Added relative for absolute positioning of line */}
                {productJourney.map((step, index) => (
                  <JourneyStep key={index} {...step} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

