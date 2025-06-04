
// src/app/dashboard/blockchain/dids/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { listOrganizationDids, createPlatformDid, associateExternalDid, type DidDocument as ActionDidDocument } from '@/app/actions/dids';
import {
  PlusCircle,
  KeyRound,
  Trash2,
  ClipboardCopy,
  Info,
  Loader2,
  ArrowLeft,
  ExternalLink,
  LinkIcon as LinkIconLucide,
  Settings2
} from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format, parseISO } from 'date-fns';

// Use the DidDocument type from actions
export type DidDocument = ActionDidDocument;

interface DisplayDid extends DidDocument {
  shortId: string;
}

const createDidFormSchema = z.object({
  method: z.string().min(1, "DID method is required."),
  alias: z.string().optional(),
});
type CreateDidFormValues = z.infer<typeof createDidFormSchema>;

const associateDidFormSchema = z.object({
  didString: z.string().startsWith("did:", "Must be a valid DID string (e.g., did:key:...).").min(10),
  alias: z.string().optional(),
});
type AssociateDidFormValues = z.infer<typeof associateDidFormSchema>;


export default function DidManagementPage() {
  const { toast } = useToast();
  const [dids, setDids] = useState<DisplayDid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [newlyCreatedDid, setNewlyCreatedDid] = useState<DidDocument | null>(null);

  const createForm = useForm<CreateDidFormValues>({
    resolver: zodResolver(createDidFormSchema),
    defaultValues: { method: 'key', alias: '' },
  });

  const associateForm = useForm<AssociateDidFormValues>({
    resolver: zodResolver(associateDidFormSchema),
    defaultValues: { didString: '', alias: '' },
  });

  const fetchDids = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listOrganizationDids();
      if (result.success && result.data) {
        setDids(result.data.map(did => ({ ...did, shortId: did.id.length > 30 ? `${did.id.substring(0, 15)}...${did.id.slice(-10)}` : did.id })));
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to load DIDs.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while fetching DIDs.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDids();
  }, [fetchDids]);

  const handleCreateDidSubmit: SubmitHandler<CreateDidFormValues> = async (data) => {
    setIsSubmitting(true);
    setNewlyCreatedDid(null);
    try {
      const result = await createPlatformDid(data.method, data.alias);
      if (result.success && result.data) {
        setNewlyCreatedDid(result.data.didDocument);
        toast({ title: 'DID Created', description: `Successfully created ${result.data.didDocument.id}` });
        fetchDids(); 
      } else {
        toast({ variant: 'destructive', title: 'Creation Failed', description: result.message || 'Could not create DID.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
      // Keep modal open to show new DID or error
    }
  };
  
  const handleAssociateDidSubmit: SubmitHandler<AssociateDidFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await associateExternalDid(data.didString, data.alias);
      if (result.success) {
        toast({ title: 'DID Associated', description: `${data.didString} associated successfully.` });
        fetchDids();
        setShowAssociateModal(false);
        associateForm.reset();
      } else {
        toast({ variant: 'destructive', title: 'Association Failed', description: result.message || 'Could not associate DID.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string = "Value") => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: 'Copied!', description: `${label} copied to clipboard.` }))
      .catch(() => toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy to clipboard.' }));
  };
  
  const resetCreateModal = () => {
    setShowCreateModal(false);
    setNewlyCreatedDid(null);
    createForm.reset();
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/blockchain/credentials">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Verifiable Credentials</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-semibold text-primary mb-1 flex items-center gap-2">
              <KeyRound className="h-8 w-8" /> Decentralized Identifier (DID) Management
            </h1>
            <p className="text-muted-foreground">
              Manage your organization's DIDs for issuing and verifying credentials.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            <Dialog open={showAssociateModal} onOpenChange={setShowAssociateModal}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <LinkIconLucide className="mr-2 h-4 w-4" /> Associate Existing DID
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                     <DialogHeader>
                        <DialogTitle className="font-headline">Associate Existing DID</DialogTitle>
                        <DialogDescription>Link an externally managed DID to your Norruva organization.</DialogDescription>
                    </DialogHeader>
                    <Form {...associateForm}>
                        <form onSubmit={associateForm.handleSubmit(handleAssociateDidSubmit)} className="space-y-6 py-4">
                            <FormField control={associateForm.control} name="didString" render={({ field }) => (
                                <FormItem><FormLabel>DID String</FormLabel><FormControl><Input placeholder="did:example:123abc456" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={associateForm.control} name="alias" render={({ field }) => (
                                <FormItem><FormLabel>Alias/Label (Optional)</FormLabel><FormControl><Input placeholder="e.g., Main Issuing DID" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline" onClick={() => { setShowAssociateModal(false); associateForm.reset();}}>Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Associate DID
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Dialog open={showCreateModal} onOpenChange={(open) => { if (!open) resetCreateModal(); else setShowCreateModal(true);}}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Platform DID
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                {!newlyCreatedDid ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-headline">Create New Platform DID</DialogTitle>
                    <DialogDescription>Generate a new DID managed by Norruva for your organization.</DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreateDidSubmit)} className="space-y-6 py-4">
                        <FormField control={createForm.control} name="method" render={({ field }) => (
                            <FormItem><FormLabel>DID Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select DID method" /></SelectTrigger></FormControl>
                                    <SelectContent><SelectItem value="key">did:key (Self-managed, good for testing)</SelectItem><SelectItem value="ebsi" disabled>did:ebsi (Mock - Coming Soon)</SelectItem></SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={createForm.control} name="alias" render={({ field }) => (
                            <FormItem><FormLabel>Alias/Label (Optional)</FormLabel><FormControl><Input placeholder="e.g., Primary Product Issuer" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                      <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" onClick={resetCreateModal}>Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create DID
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </>
                ) : (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-headline text-accent">DID Created Successfully!</DialogTitle>
                    <DialogDescription>
                        Your new DID has been created. You can now use it for issuing credentials.
                        <strong> Store any private key material securely if applicable for the chosen method (e.g., did:key).</strong>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="my-4 p-3 bg-muted rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-mono break-all" title={newlyCreatedDid.id}>{newlyCreatedDid.id}</span>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(newlyCreatedDid.id, "DID")}><ClipboardCopy className="h-4 w-4"/></Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Method: {newlyCreatedDid.id.split(':')[1]}</p>
                      {/* <p className="text-xs">Created: {format(new Date(newlyCreatedDid.created || Date.now()), 'PPp')}</p> */}
                  </div>
                  <DialogFooter>
                    <Button onClick={resetCreateModal} className="bg-primary hover:bg-primary/90">Close</Button>
                  </DialogFooter>
                </>
                )}
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <Alert variant="default" className="border-primary/30 bg-primary/5 text-primary">
        <Info className="h-5 w-5" />
        <AlertTitle className="font-headline">Understanding DIDs</AlertTitle>
        <AlertDescription>
          Decentralized Identifiers (DIDs) are unique, verifiable digital identities for your organization or products.
          They are essential for issuing and verifying Verifiable Credentials in a trusted and interoperable manner.
          <code className="text-xs bg-muted/50 p-0.5 rounded">did:key</code> is useful for development and testing, while methods like <code className="text-xs bg-muted/50 p-0.5 rounded">did:ebsi</code> are for specific ecosystems.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Your Organization's DIDs</CardTitle>
          <CardDescription>List of DIDs associated with your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading DIDs...</p>
            </div>
          ) : dids.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No DIDs found. Create or associate one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alias / Label</TableHead>
                  <TableHead>DID (Shortened)</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dids.map((did) => (
                  <TableRow key={did.id}>
                    <TableCell className="font-medium">{did.alias || <span className="text-muted-foreground italic">No Alias</span>}</TableCell>
                    <TableCell className="font-mono text-xs" title={did.id}>{did.shortId}</TableCell>
                    <TableCell><Badge variant="outline">{did.id.split(':')[1]}</Badge></TableCell>
                    <TableCell><Badge variant={did.status === 'active' ? 'default' : 'secondary'} className={did.status === 'active' ? 'bg-accent text-accent-foreground' : ''}>{did.status}</Badge></TableCell>
                    <TableCell className="text-xs">{format(parseISO(did.created), 'PP')}</TableCell>
                    <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" title="Copy DID" onClick={() => copyToClipboard(did.id, "DID")}><ClipboardCopy className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" title="View DID Document (Mock)" onClick={() => alert(`DID Document for ${did.id} (mock):\n${JSON.stringify(did, null, 2)}`)}>
                            <ExternalLink className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="icon" title="Manage (Placeholder)" disabled><Settings2 className="h-4 w-4"/></Button>
                        {/* <Button variant="ghost" size="icon" title="Revoke DID (Placeholder)" className="text-destructive hover:text-destructive/80" disabled><Trash2 className="h-4 w-4"/></Button> */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
