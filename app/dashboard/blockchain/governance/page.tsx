
// src/app/dashboard/blockchain/governance/page.tsx
"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Vote, PlusCircle, Search, ExternalLink, Clock, CheckCircle, XCircle, Award } from 'lucide-react';
import Link from 'next/link';
import { ProposalCard } from '@/components/blockchain/ProposalCard'; // Reusing this component
import { ConnectWalletButton } from '@/components/blockchain/ConnectWalletButton';
import { WalletInfo } from '@/components/blockchain/WalletInfo';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useState } from 'react';

interface MockProposal {
  id: string;
  title: string;
  description?: string;
  status: 'Active' | 'Succeeded' | 'Defeated' | 'Pending' | 'Executed' | 'Canceled';
  forVotes: number;
  againstVotes: number;
  abstainVotes?: number;
  endDate?: string; 
  proposer?: string;
}

const mockProposalsData: MockProposal[] = [
  { 
    id: 'PROP001', 
    title: 'Upgrade NoruToken to v1.1 for Enhanced DPP Features', 
    status: 'Active', 
    forVotes: 750000, 
    againstVotes: 150000, 
    abstainVotes: 25000,
    endDate: '2024-08-15', 
    proposer: '0x123...abc', 
    description: 'This proposal aims to upgrade the NoruToken smart contract to include new functionalities supporting advanced Digital Product Passport features, such as batch attestations and enhanced metadata storage. The upgrade will also include minor gas optimizations.'
  },
  { 
    id: 'PROP002', 
    title: 'Adjust Staking Rewards APR to 6% from 5%', 
    status: 'Succeeded', 
    forVotes: 950000, 
    againstVotes: 50000, 
    endDate: '2024-07-01', 
    proposer: '0xdef...456', 
    description: 'Increase the Annual Percentage Rate for NORU token staking to 6% to incentivize long-term holding and platform participation.' 
  },
  { 
    id: 'PROP003', 
    title: 'Fund Eco-Initiative Grant Pool with 100k NORU', 
    status: 'Defeated', 
    forVotes: 300000, 
    againstVotes: 600000,
    abstainVotes: 10000,
    endDate: '2024-07-20', 
    proposer: '0xghi...789', 
    description: 'Allocate 100,000 NORU tokens from the treasury to a grant pool for funding community-led ecological and sustainability projects leveraging the Norruva platform. This will foster innovation and real-world impact.' 
  },
  { 
    id: 'PROP004', 
    title: 'Integrate New Recycler Verification Protocol', 
    status: 'Pending', 
    forVotes: 0, 
    againstVotes: 0, 
    endDate: '2024-09-01', 
    proposer: '0xjkl...012', 
    description: 'Proposal to implement a new verification protocol for recycling partners to enhance data accuracy for end-of-life product phases. This involves a new smart contract module and API updates.' 
  },
  { 
    id: 'PROP005', 
    title: 'Execute Q2 Marketing Budget Allocation', 
    status: 'Executed', 
    forVotes: 800000, 
    againstVotes: 100000, 
    endDate: '2024-06-15', 
    proposer: '0xmno...345',
    description: 'Release funds as per the previously approved Q2 marketing budget proposal (PROP000-Q2MB). This action executes the on-chain transfer.'
  },
  { 
    id: 'PROP006', 
    title: 'Cancel Obsolete Feature Development (Project Phoenix)', 
    status: 'Canceled', 
    forVotes: 10000, 
    againstVotes: 5000, 
    endDate: '2024-05-30', 
    proposer: '0xpqr...678',
    description: 'This proposal was canceled by the proposer before voting concluded due to new strategic alignments.'
  },
  {
    id: 'PROP007',
    title: 'Research Grant for Advanced Material Traceability using ZK-Proofs',
    status: 'Active',
    forVotes: 450000,
    againstVotes: 50000,
    abstainVotes: 15000,
    endDate: '2024-08-25',
    proposer: '0xstu...901',
    // No description to test line-clamp
  }
];

export default function GovernancePage() {
  const { account, nativeBalance, stakedNoruBalance, providerLoading } = useBlockchain();
  const [proposals, setProposals] = useState<MockProposal[]>(mockProposalsData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleVote = (proposalId: string, voteType: 'for' | 'against' | 'abstain') => {
    alert(`Voted ${voteType} on proposal ${proposalId} (Placeholder - requires wallet interaction)`);
    // In a real app, this would trigger a smart contract interaction.
  };
  
  const filteredProposals = proposals.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold text-primary flex items-center"><Vote className="mr-3 h-8 w-8" />Governance (DAO)</h1>
          <CardDescription>Participate in decentralized decision-making for the Norruva platform.</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <ConnectWalletButton />
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
            <Link href="/dashboard/blockchain/governance/propose"><PlusCircle className="mr-2 h-4 w-4" />Create Proposal</Link>
          </Button>
        </div>
      </div>

      {account && (
        <WalletInfo 
          address={account} 
          nativeBalance={nativeBalance}
          // noruTokenBalance might not be directly relevant for governance power if only staked matters
        />
      )}
      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2"><Award className="h-5 w-5 text-primary"/>Your Voting Power</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold text-primary">{providerLoading ? 'Loading...' : (stakedNoruBalance || '0')} NORU</p>
            <p className="text-sm text-muted-foreground">Your voting power is based on your staked NORU tokens.</p>
            <Button variant="link" asChild className="mt-1 p-0 h-auto text-primary">
              <Link href="/dashboard/blockchain/staking">Manage Stake</Link>
            </Button>
        </CardContent>
      </Card>


      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Active & Recent Proposals</CardTitle>
           <div className="mt-2">
             <Input 
                type="search" 
                placeholder="Search proposals by title, ID, or description..." 
                className="max-w-md" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredProposals.length > 0 ? (
            filteredProposals.map(p => (
                <ProposalCard key={p.id} proposal={p} onVote={handleVote} />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? "No proposals match your search." : "No proposals found."}
            </p>
          )}
        </CardContent>
        <CardFooter>
            <Button variant="outline" onClick={() => alert("Load more proposals (Placeholder)")}>Load More Proposals</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

