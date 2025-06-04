// src/components/landing/social-proof-section.tsx
"use client";
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Shield, Globe } from 'lucide-react';

export default function SocialProofSection() {
  const logos = [
    { name: "GreenTech Innovations", src: "https://placehold.co/150x60/E0E0E0/1E293B?text=GreenTech" },
    { name: "EcoThreads Apparel", src: "https://placehold.co/150x60/E0E0E0/1E293B?text=EcoThreads" },
    { name: "FutureBuild Systems", src: "https://placehold.co/150x60/E0E0E0/1E293B?text=FutureBuild" },
    { name: "GlobalConnect Electronics", src: "https://placehold.co/150x60/E0E0E0/1E293B?text=GlobalConnect" },
    { name: "SustainPack Solutions", src: "https://placehold.co/150x60/E0E0E0/1E293B?text=SustainPack" },
  ];

  const testimonials = [
    {
      quote: "Norruva's visual builder made DPP creation incredibly intuitive. We were compliance-ready in weeks, not months, for the new ESPR requirements.",
      author: "Elena Rodriguez, Head of Compliance",
      company: "GreenTech Innovations",
      avatar: "https://placehold.co/50x50/FFBF00/FFFFFF?text=ER",
      dataAiHint: "compliance manager avatar",
    },
    {
      quote: "The ability to track our product lifecycle visually and collaborate with suppliers directly on the platform has given us unprecedented insights and control.",
      author: "Marcus Chen, COO",
      company: "FutureBuild Systems",
      avatar: "https://placehold.co/50x50/6699CC/FFFFFF?text=MC",
      dataAiHint: "operations manager avatar",
    },
     {
      quote: "Integrating Norruva's API was straightforward, allowing us to pull DPP data directly into our consumer-facing apps. The developer support was excellent.",
      author: "Aisha Khan, Lead Developer",
      company: "GlobalConnect Electronics",
      avatar: "https://placehold.co/50x50/8FBC8F/FFFFFF?text=AK",
      dataAiHint: "developer lead avatar",
    },
  ];

  const stats = [
    { value: "1M+", label: "DPPs Managed & Secured", icon: <Shield className="h-8 w-8 text-primary mb-2"/> },
    { value: "50+", label: "Industries Served", icon: <Globe className="h-8 w-8 text-primary mb-2"/> },
    { value: "99.9%", label: "Compliance Accuracy", icon: <Star className="h-8 w-8 text-primary mb-2 fill-primary"/> },
  ];

  return (
    <section id="social-proof" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-foreground mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Leading companies choose Norruva for visual DPP creation, robust compliance, and scalable product transparency, preparing them for a sustainable future.
          </p>
        </div>

        <div className="mb-16">
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-8 md:gap-x-16">
            {logos.map((logo) => (
              <Image
                key={logo.name}
                src={logo.src}
                alt={`${logo.name} logo`}
                width={140}
                height={50}
                className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                data-ai-hint="company logo"
              />
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card shadow-medium p-6 rounded-xl border flex flex-col">
              <CardContent className="p-0 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground italic font-inter text-md leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
                <div className="flex items-center mt-auto">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="rounded-full mr-4 border-2 border-border"
                    data-ai-hint={testimonial.dataAiHint}
                  />
                  <div>
                    <p className="font-inter font-semibold text-foreground">{testimonial.author}</p>
                    <p className="font-inter text-sm text-primary">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card p-8 rounded-lg shadow-subtle border">
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <p className="text-4xl font-space-grotesk font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-inter mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
