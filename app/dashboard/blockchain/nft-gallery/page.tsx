
// src/app/dashboard/blockchain/nft-gallery/page.tsx
"use client"; 

import React, { useState } from 'react'; // Added useState for dialog and refreshKey
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImageIcon as ImageIconLucide, Search, ExternalLink, Filter, Loader2, PlusCircle, Layers } from 'lucide-react'; // Added PlusCircle, Layers
import Link from 'next/link';
import { NFTGalleryGrid } from '@/components/blockchain/NFTGalleryGrid';
import { ConnectWalletButton } from '@/components/blockchain/ConnectWalletButton';
import { WalletInfo } from '@/components/blockchain/WalletInfo';
import { useBlockchain } from '@/hooks/useBlockchain';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Added Dialog components
import MintNFTForm from '@/components/blockchain/MintNFTForm'; // Import the new form

export default function NftGalleryPage() {
  const { account, nativeBalance, providerLoading } = useBlockchain();
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force re-render of NFTGalleryGrid

  const handleMintSuccess = () => {
    setIsMintModalOpen(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh of NFT gallery
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold text-primary flex items-center">
            <ImageIconLucide className="mr-3 h-8 w-8" />
            DPP NFT Gallery
          </h1>
          <CardDescription>View and manage your Digital Product Passport Non-Fungible Tokens (NFTs).</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Dialog open={isMintModalOpen} onOpenChange={setIsMintModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                  <Layers className="mr-2 h-4 w-4" /> Mint New DPP NFT
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-headline text-xl">Mint New DPP NFT</DialogTitle>
                  <DialogDescription>
                    Select a product to create its on-chain Digital Product Passport NFT. This will anchor key product information to the blockchain.
                  </DialogDescription>
                </DialogHeader>
                <MintNFTForm onMintSuccess={handleMintSuccess} />
                 <DialogFooter className="sm:justify-start mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <ConnectWalletButton />
        </div>
      </div>

      {account && <WalletInfo address={account} nativeBalance={nativeBalance} networkName="Mock Network" />}

      <Card className="shadow-md">
          <CardHeader>
              <CardTitle className="font-headline text-lg">Search Your NFTs</CardTitle>
               <div className="mt-2 flex flex-col sm:flex-row gap-2 items-center">
                  <div className="relative flex-grow w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                          type="search" 
                          placeholder="Search by Name, Token ID, or DPP ID..." 
                          className="pl-10 w-full" 
                      />
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => alert("Filter NFTs (Placeholder)")}>
                      <Filter className="mr-2 h-4 w-4"/>Filter
                  </Button>
                   <Button className="w-full sm:w-auto" onClick={() => alert("View on Marketplace (Placeholder)")}>
                      <ExternalLink className="mr-2 h-4 w-4"/>View on Marketplace (Mock)
                  </Button>
              </div>
          </CardHeader>
          <CardContent>
              {providerLoading && !account ? ( // Show main loader if provider is loading and no account yet
                <div className="p-4 text-center text-muted-foreground flex items-center justify-center h-60">
                  <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" /> Initializing Blockchain Connection...
                </div>
              ) : account ? ( // Only render gallery grid if account is connected
                <NFTGalleryGrid key={refreshKey} userAccount={account} />
              ) : (
                <p className="text-muted-foreground text-center py-8">Please connect your wallet to view or mint NFTs.</p>
              )}
          </CardContent>
      </Card>
      
      <Card className="shadow-sm border-primary/20 bg-primary/5">
          <CardHeader>
              <CardTitle className="font-headline text-primary">Understanding Your DPP NFTs</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-primary/80">
                  Each DPP NFT represents a unique Digital Product Passport anchored on the blockchain. 
                  These tokens ensure the authenticity and immutability of your product's passport data.
                  You can view their transaction history on a compatible block explorer.
              </p>
          </CardContent>
      </Card>
    </div>
  );
}

    