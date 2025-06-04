
// src/app/dashboard/blockchain/staking/page.tsx
"use client"; 

import React, { useState, useEffect } from 'react'; // Added useEffect
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, History, Info, TrendingUp, Layers } from 'lucide-react';
import { StakingDashboard } from '@/components/blockchain/StakingDashboard';
import { ConnectWalletButton } from '@/components/blockchain/ConnectWalletButton';
import { WalletInfo } from '@/components/blockchain/WalletInfo';
import { useBlockchain } from '@/hooks/useBlockchain'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton

interface StakingHistoryEntry {
  id: string;
  type: 'Stake' | 'Unstake' | 'Rewards Claimed';
  amount: string; // NORU amount
  date: string; // ISO string
  txHash: string;
}

// Use static dates to prevent hydration errors
const mockStakingHistory: StakingHistoryEntry[] = [
  { id: 'hist001', type: 'Stake', amount: '1000 NORU', date: '2024-06-25T10:00:00.000Z', txHash: '0xabc...123' },
  { id: 'hist002', type: 'Rewards Claimed', amount: '10.5 NORU', date: '2024-07-10T12:30:00.000Z', txHash: '0xdef...456' },
  { id: 'hist003', type: 'Stake', amount: '500 NORU', date: '2024-07-18T15:45:00.000Z', txHash: '0xghi...789' },
  { id: 'hist004', type: 'Unstake', amount: '200 NORU', date: '2024-07-23T09:15:00.000Z', txHash: '0xjkl...012' },
];


export default function StakingPage() {
  const { account, nativeBalance, noruTokenBalance, stakedNoruBalance, providerLoading } = useBlockchain();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold text-primary flex items-center">
            <DollarSign className="mr-3 h-8 w-8" />
            Token Staking (NORU)
          </h1>
          <CardDescription>
            Stake your NORU tokens to earn rewards and participate in platform governance.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <ConnectWalletButton />
          <Button variant="outline" size="sm" onClick={() => alert("View Staking Guide (placeholder)")}>
              Staking Guide
          </Button>
        </div>
      </div>
      
      {account && (
        <WalletInfo 
          address={account} 
          nativeBalance={nativeBalance} 
          noruTokenBalance={noruTokenBalance} 
          networkName="Mock Network" 
        />
      )}
      
      <StakingDashboard 
        account={account} 
        noruTokenBalance={noruTokenBalance} 
        stakedNoruBalance={stakedNoruBalance}
        isLoading={providerLoading}
      />

       <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <History className="mr-2 h-5 w-5 text-primary"/> Staking History
            </CardTitle>
            <CardDescription>Your transaction history for staking, unstaking, and reward claims.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {mockStakingHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!hasMounted ? (
                    <>
                      {mockStakingHistory.map((entry) => (
                        <TableRow key={`${entry.id}-skeleton`}>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    mockStakingHistory.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge variant={entry.type === 'Stake' ? 'default' : entry.type === 'Unstake' ? 'destructive' : 'secondary'} 
                                 className={entry.type === 'Stake' ? 'bg-accent text-accent-foreground' : entry.type === 'Unstake' ? '' : 'bg-blue-500/20 text-blue-700 border-blue-500/50'}>
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{entry.amount}</TableCell>
                        <TableCell>{format(parseISO(entry.date), 'PPp')}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <a href="#" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" title={entry.txHash}>
                            {entry.txHash.substring(0, 10)}...{entry.txHash.slice(-8)}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">No staking history available yet.</p>
            )}
          </CardContent>
       </Card>
       <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Info className="h-5 w-5 text-blue-600"/>
            <CardTitle className="font-headline text-blue-700 text-base">Understanding Staking</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600">
            <ul className="list-disc pl-5 space-y-1">
              <li>Staking NORU tokens helps secure the network (if applicable) and allows you to earn rewards.</li>
              <li>Rewards are typically distributed periodically based on the amount staked and current APY.</li>
              <li>Unstaking tokens might involve a cooldown period before they become fully available in your wallet.</li>
              <li>The Annual Percentage Yield (APY) is an estimate and can fluctuate based on network conditions and total staked amount.</li>
              <li>All transactions are recorded on the blockchain and are subject to network gas fees (in a real scenario).</li>
            </ul>
          </CardContent>
        </Card>
    </div>
  );
}

