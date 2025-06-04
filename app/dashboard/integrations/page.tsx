
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Webhook as WebhookIcon, ArrowRight, Share2 } from 'lucide-react';

export default function IntegrationsPage() {
  const integrationLinks = [
    {
      title: 'API Key Management',
      description: 'Manage API keys for programmatic access to Norruva services and data.',
      icon: <KeyRound className="h-8 w-8 text-primary" />,
      href: '/dashboard/api-keys',
      cta: 'Manage API Keys',
    },
    {
      title: 'Webhook Management',
      description: 'Configure endpoints to receive real-time event notifications from the Norruva platform.',
      icon: <WebhookIcon className="h-8 w-8 text-primary" />,
      href: '/dashboard/webhooks',
      cta: 'Manage Webhooks',
    },
    // Add more integration types here as needed
    // {
    //   title: 'EPREL Connector',
    //   description: 'Configure and monitor synchronization with the EPREL database.',
    //   icon: <ExternalLink className="h-8 w-8 text-primary" />, // Example icon
    //   href: '/dashboard/integrations/eprel', // Example link
    //   cta: 'Configure EPREL',
    // },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold text-primary mb-2 flex items-center gap-2">
          <Share2 className="h-8 w-8" /> Integrations Management
        </h1>
        <p className="text-muted-foreground">
          Connect Norruva with your other systems and manage external service integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationLinks.map((link) => (
          <Card key={link.title} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-md">
                    {link.icon}
                </div>
                <div>
                    <CardTitle className="font-headline text-xl">{link.title}</CardTitle>
                    <CardDescription className="mt-1 text-sm">{link.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Additional content for the card if needed */}
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={link.href}>
                  {link.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-sm border-blue-500/30 bg-blue-500/5">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Share2 className="h-6 w-6 text-blue-600"/>
            <div>
                <CardTitle className="font-headline text-blue-700">Expanding Your Ecosystem</CardTitle>
                <CardDescription className="text-blue-600">
                    Leverage APIs and Webhooks to seamlessly integrate Norruva's Digital Product Passport capabilities into your existing workflows, ERPs, and customer-facing applications.
                </CardDescription>
            </div>
        </CardHeader>
      </Card>

    </div>
  );
}
