// src/components/landing/DppIntegrationArchitectureSection.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Repeat, Lock, Link as LinkIconLucide, Zap, BarChart3, Landmark, KeyRound, ClipboardCheck, Layers, ImageIcon as ImageIconLucide, GitBranch, Globe, Activity, ListChecks, Package, QrCode, ShieldCheck } from 'lucide-react';

const layer1Features = [
  {
    icon: <FileText className="h-10 w-10 text-primary mb-3" />,
    title: "Product Schema",
    description: "Structured product data with ESPR-compliant fields, sustainability metrics, and supply chain tracking.",
  },
  {
    icon: <Repeat className="h-10 w-10 text-primary mb-3" />,
    title: "Real-time Sync",
    description: "Firebase Firestore triggers automatically update QR codes and blockchain records when products change.",
  },
  {
    icon: <Lock className="h-10 w-10 text-primary mb-3" />,
    title: "Security Layer",
    description: "Role-based access control with manufacturer, verifier, and regulator permissions.",
  },
];

const layer2Features = [
  {
    icon: <LinkIconLucide className="h-10 w-10 text-primary mb-3" />,
    title: "GS1 Digital Link",
    description: "Standards-compliant URLs that resolve to product information and verification endpoints.",
  },
  {
    icon: <Zap className="h-10 w-10 text-primary mb-3" />,
    title: "Dynamic Resolution",
    description: "QR codes dynamically resolve to current product state, compliance status, and blockchain verification.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary mb-3" />,
    title: "Scan Analytics",
    description: "Real-time tracking of consumer engagement, geographic distribution, and verification requests.",
  },
];

const layer3Features = [
  {
    icon: <Landmark className="h-10 w-10 text-primary mb-3" />,
    title: "EBSI Integration",
    description: "European Blockchain Service Infrastructure for issuing and verifying tamper-proof credentials.",
  },
  {
    icon: <KeyRound className="h-10 w-10 text-primary mb-3" />,
    title: "DID Management",
    description: "Decentralized Identity management for manufacturers, verifiers, and regulatory bodies.",
  },
  {
    icon: <ClipboardCheck className="h-10 w-10 text-primary mb-3" />,
    title: "ESPR Compliance",
    description: "Automated validation against Ecodesign for Sustainable Products Regulation requirements.",
  },
];

const layer4Features = [
  {
    icon: <FileText className="h-10 w-10 text-primary mb-3" />, 
    title: "Smart Contracts",
    description: "Automated DPP lifecycle management with immutable product records and verification logic.",
  },
  {
    icon: <ImageIconLucide className="h-10 w-10 text-primary mb-3" />, 
    title: "NFT Minting",
    description: "Each DPP becomes a unique NFT with embedded metadata and ownership tracking.",
  },
  {
    icon: <GitBranch className="h-10 w-10 text-primary mb-3" />, 
    title: "Cross-Chain",
    description: "Multi-chain support for Ethereum, Polygon, and EBSI with seamless interoperability.",
  },
];

const layer5Features = [
  {
    icon: <Activity className="h-10 w-10 text-primary mb-3" />,
    title: "Real-time Tracking",
    description: "Live monitoring of QR scans, verification requests, and blockchain transactions.",
  },
  {
    icon: <Globe className="h-10 w-10 text-primary mb-3" />,
    title: "Global Insights",
    description: "Geographic distribution, consumer behavior patterns, and market penetration analytics.",
  },
  {
    icon: <ListChecks className="h-10 w-10 text-primary mb-3" />,
    title: "Compliance Reports",
    description: "Automated regulatory reporting with audit trails and EBSI verification proofs.",
  },
];


export default function DppIntegrationArchitectureSection() {
  return (
    <section id="dpp-architecture-layers" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-foreground mb-3">
            Norruva DPP Platform Architecture
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-inter max-w-3xl mx-auto">
            A multi-layered approach to deliver robust, compliant, and scalable Digital Product Passports.
          </p>
        </div>

        {/* Layer 1 Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-space-grotesk font-semibold text-primary mb-3">
            Layer 1: Product Management Integration
          </h3>
          <p className="text-md md:text-lg text-muted-foreground font-inter max-w-3xl mx-auto">
            Core functionalities for robust product data handling, real-time updates, and foundational security.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {layer1Features.map((feature, index) => (
            <Card key={`layer1-${index}`} className="text-center bg-card shadow-medium hover:shadow-strong transition-shadow border flex flex-col">
              <CardHeader className="items-center pt-6">
                {feature.icon}
                <CardTitle className="font-inter text-xl font-semibold text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground font-inter">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Layer 2 Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-space-grotesk font-semibold text-primary mb-3">
            Layer 2: QR Code & GS1 Integration
          </h3>
          <p className="text-md md:text-lg text-muted-foreground font-inter max-w-3xl mx-auto">
            Connecting physical products to their digital identities with standardized and dynamic linking.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {layer2Features.map((feature, index) => (
            <Card key={`layer2-${index}`} className="text-center bg-card shadow-medium hover:shadow-strong transition-shadow border flex flex-col">
              <CardHeader className="items-center pt-6">
                {feature.icon}
                <CardTitle className="font-inter text-xl font-semibold text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground font-inter">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Layer 3 Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-space-grotesk font-semibold text-primary mb-3">
            🛡️ Layer 3: EBSI Compliance & Credentials
          </h3>
          <p className="text-md md:text-lg text-muted-foreground font-inter max-w-3xl mx-auto">
            Ensuring trusted, verifiable data through European blockchain infrastructure and decentralized identity.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {layer3Features.map((feature, index) => (
            <Card key={`layer3-${index}`} className="text-center bg-card shadow-medium hover:shadow-strong transition-shadow border flex flex-col">
              <CardHeader className="items-center pt-6">
                {feature.icon}
                <CardTitle className="font-inter text-xl font-semibold text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground font-inter">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Layer 4 Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-space-grotesk font-semibold text-primary mb-3">
            ⛓️ Layer 4: Blockchain & Smart Contracts
          </h3>
          <p className="text-md md:text-lg text-muted-foreground font-inter max-w-3xl mx-auto">
            Leveraging distributed ledger technology for immutable records, automated lifecycle management, and unique digital asset representation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {layer4Features.map((feature, index) => (
            <Card key={`layer4-${index}`} className="text-center bg-card shadow-medium hover:shadow-strong transition-shadow border flex flex-col">
              <CardHeader className="items-center pt-6">
                {feature.icon}
                <CardTitle className="font-inter text-xl font-semibold text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground font-inter">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Layer 5 Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-space-grotesk font-semibold text-primary mb-3">
            📊 Layer 5: Analytics & Monitoring
          </h3>
          <p className="text-md md:text-lg text-muted-foreground font-inter max-w-3xl mx-auto">
            Gaining actionable insights from DPP interactions, compliance status, and user engagement.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {layer5Features.map((feature, index) => (
            <Card key={`layer5-${index}`} className="text-center bg-card shadow-medium hover:shadow-strong transition-shadow border flex flex-col">
              <CardHeader className="items-center pt-6">
                {feature.icon}
                <CardTitle className="font-inter text-xl font-semibold text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground font-inter">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
