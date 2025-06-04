
// src/components/blockchain/WalletInfo.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Landmark, Coins, Loader2 } from 'lucide-react';

interface WalletInfoProps {
  address?: string | null;
  networkName?: string | null;
  nativeBalance?: string | null; // Native currency balance (e.g., ETH, MATIC)
  noruTokenBalance?: string | null;
  isLoading?: boolean;
}

export function WalletInfo({ address, networkName, nativeBalance, noruTokenBalance, isLoading }: WalletInfoProps) {
  if (isLoading) {
      return (
         <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-md font-semibold flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />Loading Wallet Info...</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-5 bg-muted rounded w-3/4 animate-pulse mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            </CardContent>
        </Card>
      );
  }
  
  if (!address) {
    // This component might not be rendered if address is null, but good to have a fallback.
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-md font-semibold flex items-center"><Wallet className="mr-2 h-5 w-5 text-muted-foreground" />Wallet Not Connected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please connect your wallet to view details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-md font-semibold flex items-center"><Wallet className="mr-2 h-5 w-5 text-primary" />Connected Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-muted-foreground">Address: </span>
          <span className="font-mono text-foreground break-all" title={address}>{`${address.substring(0, 10)}...${address.substring(address.length - 8)}`}</span>
        </div>
        {networkName && (
          <div>
            <span className="font-medium text-muted-foreground">Network: </span>
            <span className="text-foreground">{networkName}</span>
          </div>
        )}
        {nativeBalance && (
          <div className="flex items-center">
            <Landmark className="mr-1.5 h-4 w-4 text-muted-foreground"/>
            <span className="font-medium text-muted-foreground">Native Balance: </span>
            <span className="text-foreground font-semibold ml-1">{nativeBalance}</span>
          </div>
        )}
        {noruTokenBalance && (
          <div className="flex items-center">
            <Coins className="mr-1.5 h-4 w-4 text-accent"/>
            <span className="font-medium text-muted-foreground">NORU Tokens: </span>
            <span className="text-foreground font-semibold ml-1">{noruTokenBalance}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
