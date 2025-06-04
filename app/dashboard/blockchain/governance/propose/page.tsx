
// src/app/dashboard/blockchain/governance/propose/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Loader2, PlusCircle, Trash2, Info } from 'lucide-react';

interface ActionItem {
  targetAddress: string;
  value: string; // ETH value
  calldata: string; // Encoded function call
}

export default function CreateProposalPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState<ActionItem[]>([{ targetAddress: '', value: '0', calldata: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAction = () => {
    setActions([...actions, { targetAddress: '', value: '0', calldata: '' }]);
  };

  const handleActionChange = (index: number, field: keyof ActionItem, value: string) => {
    const newActions = [...actions];
    newActions[index][field] = value;
    setActions(newActions);
  };

  const handleRemoveAction = (index: number) => {
    if (actions.length > 1) {
      const newActions = actions.filter((_, i) => i !== index);
      setActions(newActions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Placeholder for actual proposal submission logic
    console.log("Submitting proposal:", { title, description, actions });
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Proposal Submitted (Mock)",
      description: `Your proposal "${title}" has been submitted for review and voting.`,
    });
    setIsSubmitting(false);
    // router.push('/dashboard/blockchain/governance'); // Or redirect
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/blockchain/governance">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Governance</span>
          </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-headline font-semibold text-primary">Create New Governance Proposal</h1>
            <p className="text-muted-foreground">Outline your proposal for the Norruva DAO to consider.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Proposal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="proposal-title">Title</Label>
              <Input 
                id="proposal-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Increase Staking Rewards for Q4" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="proposal-description">Description</Label>
              <Textarea 
                id="proposal-description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Explain the purpose and impact of your proposal..." 
                rows={5} 
                required 
                className="resize-y"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline text-xl">Proposal Actions</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddAction}><PlusCircle className="mr-2 h-4 w-4"/>Add Action</Button>
            </div>
            <CardDescription>Define the on-chain actions this proposal will execute if passed. (Advanced)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actions.map((action, index) => (
              <Card key={index} className="p-4 bg-muted/50 border">
                <h4 className="font-semibold mb-2 text-sm text-foreground">Action {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={`target-${index}`}>Target Contract Address</Label>
                        <Input id={`target-${index}`} value={action.targetAddress} onChange={e => handleActionChange(index, 'targetAddress', e.target.value)} placeholder="0x..." />
                    </div>
                    <div>
                        <Label htmlFor={`value-${index}`}>Value (ETH/Native Token)</Label>
                        <Input id={`value-${index}`} type="text" value={action.value} onChange={e => handleActionChange(index, 'value', e.target.value)} placeholder="0" />
                    </div>
                </div>
                <div className="mt-2">
                    <Label htmlFor={`calldata-${index}`}>Calldata (Hex)</Label>
                    <Textarea id={`calldata-${index}`} value={action.calldata} onChange={e => handleActionChange(index, 'calldata', e.target.value)} placeholder="0x..." rows={2} className="font-mono text-xs resize-y"/>
                </div>
                 {actions.length > 1 && (
                    <Button type="button" variant="destructive" size="xs" onClick={() => handleRemoveAction(index)} className="mt-2">
                        <Trash2 className="mr-1 h-3 w-3"/>Remove Action {index+1}
                    </Button>
                )}
              </Card>
            ))}
            <Card className="mt-2 p-3 bg-blue-500/5 border-blue-500/20">
                <div className="flex items-start">
                    <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5"/>
                    <p className="text-xs text-blue-700">
                        Defining proposal actions requires technical knowledge of smart contract interactions. Incorrect calldata can lead to failed proposals or unintended consequences. Consult documentation or an expert if unsure.
                    </p>
                </div>
            </Card>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
