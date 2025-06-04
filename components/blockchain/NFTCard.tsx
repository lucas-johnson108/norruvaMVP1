
// src/components/blockchain/NFTCard.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, ExternalLink, ShieldCheck, Info } from 'lucide-react'; // Renamed to avoid conflict
import Link from 'next/link';

export interface DPPNft {
  id: string; // Product ID or internal ID
  tokenId: string; // Blockchain NFT Token ID
  name: string;
  gtin?: string;
  imageUrl?: string;
  status?: 'Verified' | 'Pending' | 'Minted' | string; // DPP status related to this NFT
  explorerLink?: string; // Link to view NFT on a block explorer
  dppLink?: string; // Link to view the full DPP on Norruva
}

interface NFTCardProps {
  nft: DPPNft;
}

export default function NFTCard({ nft }: NFTCardProps) {
  
  const getStatusBadge = () => {
    switch (nft.status?.toLowerCase()) {
      case 'verified':
        return <Badge className="bg-accent text-accent-foreground"><ShieldCheck className="mr-1 h-3 w-3"/>Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-600">Pending</Badge>;
      case 'minted':
         return <Badge variant="outline" className="text-primary border-primary/50">Minted</Badge>;
      default:
        return <Badge variant="outline">{nft.status || "Unknown"}</Badge>;
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-3">
        <div className="aspect-[16/10] bg-muted rounded-md mb-3 overflow-hidden relative border">
          {nft.imageUrl ? (
            <img src={nft.imageUrl} alt={nft.name} data-ai-hint="nft product visual" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-primary truncate" title={nft.name}>{nft.name}</CardTitle>
            {nft.status && getStatusBadge()}
        </div>
        {nft.gtin && <CardDescription className="text-xs font-mono">GTIN: {nft.gtin}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground flex-grow">
        <p>Token ID: <span className="font-mono text-foreground block truncate" title={nft.tokenId}>{nft.tokenId}</span></p>
        {/* Add more NFT specific details here if needed */}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-3">
        {nft.dppLink && (
          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
            <Link href={nft.dppLink}><Info className="mr-1 h-3 w-3"/>View DPP</Link>
          </Button>
        )}
        {nft.explorerLink && (
          <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto text-primary hover:text-primary/80">
            <Link href={nft.explorerLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3"/>View on Explorer
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
