
// src/components/blockchain/ProposalCard.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, ExternalLink, Vote as VoteIcon, Info } from 'lucide-react';
import Link from 'next/link';

interface Proposal {
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

interface ProposalCardProps {
  proposal: Proposal;
  onVote?: (proposalId: string, voteType: 'for' | 'against' | 'abstain') => void;
  className?: string;
}

export function ProposalCard({ proposal, onVote, className }: ProposalCardProps) {
  const totalVotes = proposal.forVotes + proposal.againstVotes + (proposal.abstainVotes || 0);
  const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'Active': return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/50"><Clock className="mr-1 h-3 w-3"/>Active</Badge>;
      case 'Succeeded': return <Badge className="bg-accent text-accent-foreground"><CheckCircle className="mr-1 h-3 w-3"/>Succeeded</Badge>;
      case 'Defeated': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Defeated</Badge>;
      case 'Executed': return <Badge className="bg-green-600/20 text-green-700 border-green-600/50"><CheckCircle className="mr-1 h-3 w-3"/>Executed</Badge>;
      case 'Canceled': return <Badge variant="outline" className="border-gray-400 text-gray-600"><XCircle className="mr-1 h-3 w-3"/>Canceled</Badge>;
      case 'Pending': return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-600 border-yellow-500/50"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
      default: return <Badge variant="outline">{proposal.status}</Badge>;
    }
  };

  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-md font-semibold text-primary leading-tight">{proposal.title}</CardTitle>
          {getStatusBadge()}
        </div>
        {proposal.description && <CardDescription className="text-xs mt-1 line-clamp-2">{proposal.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-green-600 font-medium">For: {proposal.forVotes.toLocaleString()} ({forPercentage.toFixed(1)}%)</span>
            <span className="text-red-600 font-medium">Against: {proposal.againstVotes.toLocaleString()} ({againstPercentage.toFixed(1)}%)</span>
          </div>
          <Progress value={forPercentage} className="h-1.5" />
          {/* A more complex stacked bar could show for/against/abstain if needed */}
        </div>
        {proposal.proposer && <p className="text-xs text-muted-foreground">Proposed by: <span className="font-mono text-foreground">{proposal.proposer.substring(0,10)}...</span></p>}
        {proposal.endDate && <p className="text-xs text-muted-foreground">Voting ends: {new Date(proposal.endDate).toLocaleDateString()}</p>}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link href={`/dashboard/blockchain/governance/proposal/${proposal.id}`}> {/* Assuming a detail page */}
            <Info className="mr-1 h-3 w-3" /> View Details
          </Link>
        </Button>
        {proposal.status === 'Active' && onVote && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button size="sm" variant="ghost" className="flex-1 text-green-600 hover:bg-green-500/10 hover:text-green-700" onClick={() => onVote(proposal.id, 'for')}>
              <VoteIcon className="mr-1 h-4 w-4"/> For
            </Button>
            <Button size="sm" variant="ghost" className="flex-1 text-red-600 hover:bg-red-500/10 hover:text-red-700" onClick={() => onVote(proposal.id, 'against')}>
              <VoteIcon className="mr-1 h-4 w-4"/> Against
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
