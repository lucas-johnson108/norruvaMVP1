
// src/components/landing/pricing-section.tsx
"use client";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Star } from 'lucide-react';

export default function PricingSection() {
  const plans = [
    { 
      name: "Starter", 
      price: "Free", 
      period: "for individuals", 
      description: "Perfect for exploring core DPP features and getting started with product transparency.", 
      features: [
        "Up to 10 Product Passports", 
        "Visual DPP Builder (Basic)", 
        "Public QR Code Generation", 
        "Community Support"
      ], 
      cta: "Start For Free", 
      ctaVariant: "outline" as "outline" | "default", // To control button style based on theme
      popular: false 
    },
    { 
      name: "Professional", 
      price: "€299", 
      period: "/month", 
      description: "For growing businesses needing robust compliance tools and collaboration features.", 
      features: [
        "Up to 500 Product Passports", 
        "Full Visual DPP Builder", 
        "Customizable Templates",
        "API Access (Basic)",
        "Team Collaboration (3 users)",
        "Standard Compliance Analytics",
        "Email Support"
      ], 
      cta: "Get Started", 
      ctaVariant: "default" as "outline" | "default", // Primary CTA will use accent color
      popular: true 
    },
    { 
      name: "Enterprise", 
      price: "Custom", 
      period: "for large teams", 
      description: "Tailored solutions for organizations with complex DPP needs and scalability requirements.", 
      features: [
        "Unlimited Product Passports", 
        "Advanced API & Integrations",
        "Automated Compliance Monitoring",
        "Enterprise Security & SSO",
        "Dedicated Support Manager",
        "Custom Onboarding & Training"
      ], 
      cta: "Contact Sales", 
      ctaVariant: "outline" as "outline" | "default",
      popular: false 
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-card"> {/* Changed to bg-card (white) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-foreground mb-4"> {/* Font & Color */}
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter"> {/* Font & Color */}
            Choose the plan that best fits your Digital Product Passport needs. No hidden fees, cancel anytime.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={cn(
                "flex flex-col bg-background rounded-xl shadow-medium border", /* Use bg-background for cards on white section */
                plan.popular ? 'border-primary ring-2 ring-primary relative' : 'border-border'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold font-inter tracking-wider shadow-md flex items-center">
                    <Star className="h-4 w-4 mr-1.5 fill-primary-foreground text-primary-foreground"/> MOST POPULAR
                  </span>
                </div>
              )}
              <CardHeader className="text-center pt-10 pb-6">
                <CardTitle className="font-inter text-2xl font-bold text-foreground mb-2">{plan.name}</CardTitle> {/* Color */}
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-foreground font-inter">{plan.price}</span> {/* Color */}
                  {plan.price !== "Custom" && <span className="text-muted-foreground font-inter">{plan.period}</span>} {/* Color */}
                  {plan.price === "Custom" && <span className="block text-sm text-muted-foreground font-inter">{plan.period}</span>} {/* Color */}
                </div>
                <CardDescription className="font-inter text-sm text-muted-foreground min-h-[60px]">{plan.description}</CardDescription> {/* Color */}
              </CardHeader>
              <CardContent className="flex-grow px-6 md:px-8">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-muted-foreground font-inter text-sm"> {/* Color */}
                      <Check className="text-accent mr-3 flex-shrink-0 h-5 w-5 mt-0.5" /> {/* Accent color for checkmarks */}
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 md:p-8 pt-0 mt-auto">
                 <Button 
                  asChild 
                  size="lg"
                  variant={plan.ctaVariant} // Use the new ctaVariant prop
                  className={cn(
                    "w-full py-3.5 rounded-lg font-inter font-semibold transition-colors shadow-subtle hover:shadow-medium",
                    plan.ctaVariant === 'default' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'text-accent border-accent hover:bg-accent/10'
                  )}
                >
                  <Link href={plan.cta === "Contact Sales" ? "#contact" : "/app"}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
