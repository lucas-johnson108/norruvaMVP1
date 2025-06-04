'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext'; // Corrected path
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Use centralized Firebase instance
import { Package, CheckCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';

interface DPPNft {
  id: string;
  tokenId: string;
  name: string;
  gtin: string;
  category: string;
  status: string; // e.g., 'verified', 'pending'
  blockchainTxHash: string;
  created: Date; 
}

export function NFTGallery() {
  const [nfts, setNfts] = useState<DPPNft[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 
  
  useEffect(() => {
    const organizationId = user?.organizationId; 
    if (!organizationId) {
      setLoading(false); 
      setNfts([]); 
      return;
    }
    
    setLoading(true);
    const q = query(
      collection(db, 'products'), 
      where('organizationId', '==', organizationId),
      where('tokenId', '!=', null) 
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nftData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tokenId: data.tokenId,
          name: data.name,
          gtin: data.gtin,
          category: data.category,
          status: data.status,
          blockchainTxHash: data.blockchainTxHash,
          created: data.created?.toDate ? data.created.toDate() : new Date(data.created) 
        } as DPPNft;
      });
      
      setNfts(nftData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching NFTs:", error);
      setLoading(false);
    });
    
    return () => unsubscribe(); 
  }, [user]); 
  
  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading NFT gallery...
      </div>
    );
  }

  if (!user || !user.organizationId) {
    return <div className="p-4 text-center text-muted-foreground">Please log in and ensure your organization is set up to see your NFTs.</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Removed title and badge as they are now in the parent page */}
      {nfts.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No DPP NFTs found for your organization yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <Card key={nft.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate" title={nft.name}>{nft.name || 'Unnamed Product'}</CardTitle>
                  <Badge 
                    variant={nft.status === 'verified' ? 'default' : 'secondary'}
                    className={`flex items-center gap-1 text-xs ${nft.status === 'verified' ? 'bg-accent text-accent-foreground' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300'}`}
                  >
                    {nft.status === 'verified' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {nft.status || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Token ID:</span>
                    <div className="font-mono text-xs">#{nft.tokenId}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GTIN:</span>
                    <div className="font-mono text-xs">{nft.gtin || 'N/A'}</div>
                  </div>
                   <div>
                    <span className="text-muted-foreground">Category:</span>
                    <div className="text-xs">{nft.category || 'N/A'}</div>
                  </div>
                   <div>
                    <span className="text-muted-foreground">Minted:</span>
                    <div className="text-xs">{nft.created ? new Date(nft.created).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
                {nft.blockchainTxHash && (
                   <a 
                      href={`https://polygonscan.com/tx/${nft.blockchainTxHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" /> View on Explorer (Mock Link)
                    </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
