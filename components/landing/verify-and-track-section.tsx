// src/components/landing/verify-and-track-section.tsx
"use client";
import Image from 'next/image';
import { Network, QrCode, Users, ShieldCheck, BarChart3, GitBranch } from 'lucide-react';

export default function VerifyAndTrackSection() {
  const features = [
    {
      icon: <Network className="h-8 w-8 text-primary" />,
      title: "Supply Chain Collaboration",
      description: "Securely map your supply chain and automate data requests from suppliers for full traceability.",
    },
    {
      icon: <QrCode className="h-8 w-8 text-primary" />,
      title: "Physical-Digital Link",
      description: "Easily generate and manage GS1 Digital Link QR codes, NFC tags, or other carriers to connect physical products to their DPPs.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Automated Verification Workflows",
      description: "Streamline compliance with automated checks against regulations and internal standards, with clear audit trails.",
    },
    {
      icon: <GitBranch className="h-8 w-8 text-primary" />,
      title: "Lifecycle Event Tracking",
      description: "Record key events like manufacturing, repairs, and end-of-life processing directly within the DPP.",
    },
  ];

  return (
    <section id="verify-track" className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-foreground mb-4">
            Verify, Track, and Engage
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Gain unprecedented visibility into your product's journey, ensure data integrity, and empower consumers with transparent information.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 order-2 md:order-1">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start">
                <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
                  {feature.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-inter font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-muted-foreground font-inter">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="https://placehold.co/600x450/F0F0F0/1E293B?text=Lifecycle+Tracking+UI"
              alt="Product journey visualization with data points and verification checks"
              width={600}
              height={450}
              className="rounded-xl shadow-strong object-cover border"
              data-ai-hint="product lifecycle journey map visualization"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
