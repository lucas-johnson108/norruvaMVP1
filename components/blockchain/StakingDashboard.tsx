
// src/components/blockchain/StakingDashboard.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, TrendingUp, DollarSign, Loader2, ShieldCheck, Info, Gift, Download, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBlockchain } from '@/hooks/useBlockchain'; // Import useBlockchain hook

interface StakingDashboardProps {
  account: string | null;
  noruTokenBalance: string | null;
  stakedNoruBalance: string | null;
  isLoading: boolean; // General loading for balances etc.
  // Action functions will now come from useBlockchain hook
}

export function StakingDashboard({
  account,
  noruTokenBalance,
  stakedNoruBalance,
  isLoading,
}: StakingDashboardProps) {
  const { toast } = useToast();
  const { stakeTokens, unstakeTokens, claimRewards, actionLoading, refreshData } = useBlockchain();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  
  const mockApy = 12.4; 
  const pendingRewardsRaw = stakedNoruBalance ? (parseFloat(stakedNoruBalance) * (mockApy / 100 / 12)) : 0; // Simplified monthly reward
  const mockPendingRewards = pendingRewardsRaw.toFixed(Math.max(2, (pendingRewardsRaw.toString().split('.')[1]?.length || 0)));


  const handleStake = async () => {
    if (!account) {
      toast({ variant: "destructive", title: "Wallet Not Connected", description: "Please connect your wallet to stake tokens." });
      return;
    }
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount to stake." });
      return;
    }
    if (parseFloat(stakeAmount) > parseFloat(noruTokenBalance || '0')) {
        toast({ variant: "destructive", title: "Insufficient Balance", description: "You don't have enough NORU tokens to stake this amount."});
        return;
    }
    try {
      await stakeTokens(parseFloat(stakeAmount));
      setStakeAmount('');
      refreshData(); // Refresh balances after action
    } catch (e) { /* Error handled by hook's toast */ }
  };

  const handleUnstake = async () => {
    if (!account) {
      toast({ variant: "destructive", title: "Wallet Not Connected", description: "Please connect your wallet to unstake." });
      return;
    }
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount to unstake." });
      return;
    }
    if (parseFloat(unstakeAmount) > parseFloat(stakedNoruBalance || '0')) {
        toast({ variant: "destructive", title: "Insufficient Staked Balance", description: "You don't have enough staked NORU tokens to unstake this amount."});
        return;
    }
     try {
      await unstakeTokens(parseFloat(unstakeAmount));
      setUnstakeAmount('');
      refreshData();
    } catch (e) { /* Error handled by hook's toast */ }
  };

  const handleClaimRewards = async () => {
     if (!account) {
      toast({ variant: "destructive", title: "Wallet Not Connected", description: "Please connect your wallet to claim rewards." });
      return;
    }
    if (parseFloat(mockPendingRewards) <= 0) {
        toast({ variant: "destructive", title: "No Rewards", description: "No pending rewards to claim." });
        return;
    }
    try {
      await claimRewards();
      refreshData();
    } catch (e) { /* Error handled by hook's toast */ }
  };


  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-muted-foreground">Loading staking information...</p>
      </Card>
    );
  }

  if (!account) {
     return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Staking Overview</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-8">Please connect your wallet to view and manage staking.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available NORU</CardTitle>
            <Coins className="absolute right-4 top-4 h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{noruTokenBalance || '0.00'}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Currently Staked</CardTitle>
            <ShieldCheck className="absolute right-4 top-4 h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stakedNoruBalance || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Earning ~{mockApy.toFixed(1)}% APY (Est.)</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Rewards</CardTitle>
            <Gift className="absolute right-4 top-4 h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{mockPendingRewards} NORU</div>
            <Button 
                variant="link" 
                size="xs" 
                className="p-0 h-auto text-accent text-xs mt-1"
                onClick={handleClaimRewards}
                disabled={actionLoading || parseFloat(mockPendingRewards) <= 0}
            >
                {actionLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin"/> : null} Claim Rewards
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-primary"/>Manage Your Stake</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-3 p-4 border rounded-lg bg-card">
                 <h3 className="font-semibold text-md text-foreground">Stake NORU Tokens</h3>
                 <div>
                    <Label htmlFor="stake-amount-dash">Amount to Stake</Label>
                    <Input 
                        id="stake-amount-dash" 
                        type="number" 
                        placeholder="e.g., 1000" 
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        disabled={actionLoading || !account}
                        min="0"
                        className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Available to stake: {noruTokenBalance || '0.00'} NORU
                    </p>
                </div>
                <Button 
                    onClick={handleStake} 
                    disabled={actionLoading || !stakeAmount || !account || parseFloat(stakeAmount) <=0 || parseFloat(stakeAmount) > parseFloat(noruTokenBalance || '0') }
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                    {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Stake NORU
                </Button>
            </div>
             <div className="space-y-3 p-4 border rounded-lg bg-card">
                <h3 className="font-semibold text-md text-foreground">Unstake NORU Tokens</h3>
                <div>
                    <Label htmlFor="unstake-amount-dash">Amount to Unstake</Label>
                    <Input 
                        id="unstake-amount-dash" 
                        type="number" 
                        placeholder="e.g., 500" 
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                        disabled={actionLoading || !account}
                        min="0"
                        className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Currently staked: {stakedNoruBalance || '0.00'} NORU
                    </p>
                </div>
                <Button 
                    onClick={handleUnstake} 
                    disabled={actionLoading || !unstakeAmount || !account || parseFloat(unstakeAmount) <=0 || parseFloat(unstakeAmount) > parseFloat(stakedNoruBalance || '0') }
                    variant="outline"
                    className="w-full sm:w-auto"
                >
                    {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4"/>}
                    Unstake NORU
                </Button>
            </div>
        </CardContent>
        <CardFooter>
            <div className="flex items-start p-3 bg-blue-500/5 border border-blue-500/20 rounded-md w-full">
                <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 shrink-0"/>
                <p className="text-xs text-blue-700">
                    Staking involves locking your tokens in a smart contract. Ensure you understand the terms and potential risks. APY is subject to change. This is a mock interface; real transactions are not processed.
                </p>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
