// src/components/landing/design-and-build-section.tsx
"use client";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PencilRuler, Library, Eye, Palette, Workflow, CheckCircle } from 'lucide-react';

export default function DesignAndBuildSection() {
  const features = [
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "Visual DPP Editor",
      description: "Intuitive drag-and-drop interface to construct rich Digital Product Passports. No coding required, just your product knowledge.",
    },
    {
      icon: <Library className="h-8 w-8 text-primary" />,
      title: "Smart Template Library",
      description: "Accelerate DPP creation with pre-built, industry-specific templates for ESPR, batteries, textiles, and more. Customize them to fit your exact needs.",
    },
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: "Real-time Previews",
      description: "Instantly see how your DPP will appear to consumers, partners, and regulators across various devices as you build it.",
    },
    {
      icon: <Workflow className="h-8 w-8 text-primary" />,
      title: "Automated Data Mapping",
      description: "Connect to existing data sources (PIM, ERP) and map fields to your DPP structure with ease, reducing manual entry.",
    },
  ];

  return (
    <section id="design-build" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-foreground mb-4">
            Design and Build Without Limits
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Norruva empowers you to create comprehensive and compliant Digital Product Passports with unparalleled ease and flexibility.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="https://placehold.co/600x450/E0E0E0/1E293B?text=DPP+Visual+Editor"
              alt="Norruva visual DPP editor interface showing a passport being built"
              width={600}
              height={450}
              className="rounded-xl shadow-strong object-cover border"
              data-ai-hint="dpp visual editor interface screenshot"
            />
          </div>
          <div className="space-y-8">
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
        </div>
      </div>
    </section>
  );
}
