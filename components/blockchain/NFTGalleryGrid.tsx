
// src/components/blockchain/NFTGalleryGrid.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import NFTCard, { type DPPNft } from './NFTCard';
import { Loader2, Search } from 'lucide-react';
import { listProductsAction, type MockProduct } from '@/app/actions/products'; // Import listProductsAction
import { useToast } from '@/hooks/use-toast'; // Import useToast for error handling

interface NFTGalleryGridProps {
  userAccount: string | null; // Wallet address of the current user
}

export function NFTGalleryGrid({ userAccount }: NFTGalleryGridProps) {
  const [nfts, setNfts] = useState<DPPNft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAndTransformNfts = useCallback(async () => {
    if (!userAccount) {
      setNfts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use listProductsAction to get products.
      // 'admin-view-all-for-mock' will fetch all products from the mock DB for demo purposes.
      // In a real app, you'd pass the actual companyId of the logged-in user.
      const productActionResult = await listProductsAction('admin-view-all-for-mock');

      if (productActionResult.success && Array.isArray(productActionResult.data)) {
        const productsWithBlockchainData = productActionResult.data.filter(
          (product: MockProduct) => product.blockchain && product.blockchain.nftTokenId
        );

        const transformedNfts: DPPNft[] = productsWithBlockchainData.map(
          (product: MockProduct) => ({
            id: product.id, // Use product.id as the base ID
            tokenId: product.blockchain!.nftTokenId!, // Safe due to filter
            name: `${product.name} - NFT`,
            gtin: product.gtin,
            imageUrl: product.imageUrl || `https://placehold.co/300x200.png?text=${encodeURIComponent(product.name.substring(0,10))}`,
            status: product.dppStatus === 'Complete' ? 'Verified' : 'Minted', // Example status mapping
            explorerLink: product.blockchain!.contractAddress ? `#mock-explorer/token/${product.blockchain!.contractAddress}/${product.blockchain!.nftTokenId}` : '#',
            dppLink: `/dashboard/products/edit/${product.id}`, // Link to the product detail page
          })
        );
        setNfts(transformedNfts);
      } else {
        setError(productActionResult.message || "Failed to load products for NFT gallery.");
        toast({
          variant: "destructive",
          title: "Error Loading NFTs",
          description: productActionResult.message || "Could not fetch product data to display NFTs.",
        });
      }
    } catch (err: any) {
      console.error("Error fetching user NFTs:", err);
      setError("Failed to load NFTs. Please try again.");
      toast({
        variant: "destructive",
        title: "Error Loading NFTs",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  }, [userAccount, toast]);

  useEffect(() => {
    fetchAndTransformNfts();
  }, [fetchAndTransformNfts]);

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" /> Loading your NFTs...
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center py-8">{error}</p>;
  }

  if (!userAccount) {
      return <p className="text-muted-foreground text-center py-8">Connect your wallet to see your NFTs.</p>;
  }

  if (nfts.length === 0) {
    return (
        <div className="text-center py-10 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 text-primary/30"/>
            <p>No DPP NFTs found for your organization or connected account.</p>
            <p className="text-xs mt-1">Try minting an NFT for one of your products.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-4">
      {nfts.map((nft) => (
        <NFTCard key={nft.tokenId || nft.id} nft={nft} />
      ))}
    </div>
  );
}

    