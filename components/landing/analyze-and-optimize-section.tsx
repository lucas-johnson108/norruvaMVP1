// src/components/landing/analyze-and-optimize-section.tsx
"use client";
import Image from 'next/image';
import { ShieldCheck, TrendingUp, BarChartBig, BrainCircuit, Lightbulb } from 'lucide-react'; 

export default function AnalyzeAndOptimizeSection() {
  const features = [
    {
      icon: <BarChartBig className="h-8 w-8 text-primary" />,
      title: "Comprehensive Analytics",
      description: "Unlock insights on DPP engagement, compliance hotspots, supply chain performance, and consumer interaction patterns.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Automated Regulation Tracking",
      description: "Stay ahead with real-time updates and AI-driven analysis on evolving EU regulations like ESPR, Battery Passport, and more.",
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: "AI-Powered Compliance Checks",
      description: "Leverage Genkit AI to automatically assess your DPP data against specified standards, identifying gaps and areas for improvement.",
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: "Actionable Recommendations",
      description: "Receive data-driven suggestions to enhance sustainability, optimize supply chains, and improve product design based on DPP insights.",
    },
  ];

  return (
    <section id="analyze-optimize" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-foreground mb-4">
            Analyze, Optimize, and Comply
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Turn your Digital Product Passport data into actionable intelligence. Monitor compliance, identify optimization opportunities, and prepare for future regulations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="https://placehold.co/600x450/E0E0E0/1E293B?text=Analytics+Dashboard"
              alt="Clean dashboard interface showing compliance analytics and sustainability scores"
              width={600}
              height={450}
              className="rounded-xl shadow-strong object-cover border"
              data-ai-hint="compliance dashboard analytics interface charts"
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
