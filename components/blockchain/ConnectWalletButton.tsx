
// src/components/blockchain/ConnectWalletButton.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, LogOut } from 'lucide-react';
import { useBlockchain } from '@/hooks/useBlockchain'; // Assuming a unified hook

export function ConnectWalletButton() {
  const { connectWallet, disconnectWallet, account, isConnected, providerLoading } = useBlockchain();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      // Error handling is likely within useBlockchain hook or shown via toast
      console.error("Connect wallet button caught error:", error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (providerLoading && !isConnected) {
    return (
      <Button disabled className="w-full sm:w-auto">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking Wallet...
      </Button>
    );
  }

  return (
    <div>
      {isConnected && account ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md hidden sm:inline-block" title={account}>
            {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
          </span>
          <Button variant="outline" size="sm" onClick={handleDisconnect} className="w-full sm:w-auto">
            <LogOut className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Disconnect</span>
          </Button>
        </div>
      ) : (
        <Button onClick={handleConnect} disabled={providerLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          {providerLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
          {providerLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
}
