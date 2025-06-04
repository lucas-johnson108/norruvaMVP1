// src/components/landing/scale-and-collaborate-section.tsx
"use client";
import Image from 'next/image';
import { Users2, Zap, ShieldAlert, Share2, GitMerge, Cloud } from 'lucide-react';

export default function ScaleAndCollaborateSection() {
  const features = [
    {
      icon: <Users2 className="h-8 w-8 text-primary" />,
      title: "Seamless Team Collaboration",
      description: "Work together with role-based access, version control, and auditable change logs for all DPP data.",
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: "Extensible API & Webhooks",
      description: "Integrate Norruva with your existing ERP, PLM, and SCM systems using our robust APIs and real-time webhooks.",
    },
    {
      icon: <Cloud className="h-8 w-8 text-primary" />,
      title: "Cloud-Native Scalability",
      description: "Built on a secure and reliable cloud infrastructure that scales with your business needs, from startups to large enterprises.",
    },
    {
      icon: <ShieldAlert className="h-8 w-8 text-primary" />,
      title: "Enterprise-Grade Security",
      description: "Protect your sensitive product data with industry-standard security protocols, data encryption, and access controls.",
    },
  ];

  return (
    <section id="scale-collaborate" className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-foreground mb-4">
            Scale, Collaborate, and Integrate
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Norruva is designed for growth and teamwork. Connect your ecosystem, manage complex supply chains, and ensure data integrity across your organization.
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
              src="https://placehold.co/600x450/F0F0F0/1E293B?text=Collaboration+UI"
              alt="Team workspace interface showing collaboration on DPPs and API integration points"
              width={600}
              height={450}
              className="rounded-xl shadow-strong object-cover border"
              data-ai-hint="team collaboration interface api integration"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
