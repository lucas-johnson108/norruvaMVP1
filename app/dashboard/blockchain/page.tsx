
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIconLucide, DollarSign, Vote, ShieldAlert, BarChart3, ArrowRight, GanttChartSquare, BookCopy, Layers, Users, Info } from 'lucide-react';
import BlockchainAnalyticsWidgets from '@/components/blockchain/BlockchainAnalyticsWidgets'; // Import the new component

const blockchainFeatures = [
  {
    title: 'DPP NFT Gallery',
    description: 'View and manage your Digital Product Passport Non-Fungible Tokens (NFTs).',
    icon: <ImageIconLucide className="h-8 w-8 text-primary" />,
    link: '/dashboard/blockchain/nft-gallery',
    cta: 'View NFT Gallery',
    stat: '1,589 NFTs Minted',
  },
  {
    title: 'Token Staking (NORU)',
    description: 'Stake your NORU utility tokens to earn rewards and participate in governance.',
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    link: '/dashboard/blockchain/staking',
    cta: 'Manage Staking',
    stat: '847K NORU Staked',
  },
  {
    title: 'Governance (DAO)',
    description: 'Participate in decentralized decision-making for platform evolution.',
    icon: <Vote className="h-8 w-8 text-primary" />,
    link: '/dashboard/blockchain/governance',
    cta: 'Go to Governance',
    stat: '2 Active Proposals',
  },
  {
    title: 'EBSI Verifiable Credentials',
    description: 'Manage and issue EBSI-compliant Verifiable Credentials for product attestations.',
    icon: <ShieldAlert className="h-8 w-8 text-primary" />,
    link: '/dashboard/blockchain/credentials',
    cta: 'Manage Credentials',
    stat: '56 Credentials Issued',
  },
  {
    title: 'On-Chain Analytics',
    description: 'View analytics related to on-chain activities and DPP interactions.',
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    link: '/dashboard/blockchain/analytics',
    cta: 'View Analytics',
    stat: '1.2k Transactions (24h)',
  },
  {
    title: 'Smart Contract Info',
    description: 'View details and ABIs for deployed smart contracts.',
    icon: <BookCopy className="h-8 w-8 text-primary" />,
    link: '/dashboard/blockchain/contracts', 
    cta: 'View Contracts',
    stat: '4 Main Contracts',
  }
];

export default function BlockchainHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold text-primary mb-2 flex items-center gap-2">
          <GanttChartSquare className="h-8 w-8" /> Blockchain & Compliance Hub
        </h1>
        <p className="text-muted-foreground">
          Oversee your on-chain assets, participate in governance, and manage advanced regulatory compliance infrastructure.
        </p>
      </div>

      <section className="blockchain-overview-widgets">
        <h2 className="text-xl font-headline font-semibold text-foreground mb-4">Blockchain Activity Overview</h2>
        <BlockchainAnalyticsWidgets />
      </section>
      
      <section>
        <h2 className="text-xl font-headline font-semibold text-foreground mb-4">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blockchainFeatures.map((feature) => (
            <Card key={feature.title} className="flex flex-col justify-between hover:shadow-xl transition-shadow shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {feature.icon}
                  <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-sm h-16">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {feature.stat && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quick Stat:</p>
                    <p className="text-lg font-semibold text-primary">{feature.stat}</p>
                  </div>
                )}
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href={feature.link}>
                    {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

       <Card className="shadow-sm border-blue-500/30 bg-blue-500/5 mt-10">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Info className="h-6 w-6 text-blue-600"/>
            <div>
                <CardTitle className="font-headline text-blue-700">Important Notes</CardTitle>
                <CardDescription className="text-blue-600 text-xs">
                    Data displayed on this hub is for illustrative purposes and may use mock values. 
                    Always refer to official block explorers and your wallet for definitive on-chain transaction status and balances.
                </CardDescription>
            </div>
        </CardHeader>
      </Card>

    </div>
  );
}
