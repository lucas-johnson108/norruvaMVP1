
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'; // Added Link import
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { listApiKeys, createApiKey, revokeApiKey, type ApiKey } from '@/app/actions/apiKeys';
import {
  PlusCircle,
  KeyRound,
  Trash2,
  ClipboardCopy,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Edit2,
  CalendarClock,
  ArrowLeft 
} from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format, parseISO, isValid } from 'date-fns';

const apiKeyFormSchema = z.object({
  name: z.string().min(3, "Key name must be at least 3 characters.").max(50, "Key name must be 50 characters or less."),
  permissions: z.array(z.string()).min(1, "Please select at least one permission."),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

const availablePermissions = [
  { id: 'read:product:all', label: 'Read All Product Data' },
  { id: 'read:product:publicData', label: 'Read Product Public Data' },
  { id: 'read:product:restrictedData', label: 'Read Product Restricted Data' },
  { id: 'read:product:privateData', label: 'Read Product Private Data' },
  { id: 'write:product:all', label: 'Write All Product Data (Full Control)' },
  { id: 'write:product:publicData', label: 'Write Product Public Data' },
  { id: 'write:product:sustainabilityData', label: 'Write Product Sustainability Data' },
  { id: 'write:product:supplyChainData', label: 'Write Product Supply Chain Data' },
  { id: 'read:verification:status', label: 'Read Verification Status' },
  { id: 'write:verification:request', label: 'Request Product Verification' },
  { id: 'manage:verifiers', label: 'Manage Verifiers (Admin)' },
  { id: 'read:analytics', label: 'Read Analytics Data' },
  { id: 'manage:webhooks', label: 'Manage Webhooks' },
  { id: 'manage:company:settings', label: 'Manage Company Settings (Admin)' },
];


export default function ApiKeysPage() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ id: string; token: string; name: string; prefix: string; } | null>(null);

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: '',
      permissions: [],
    },
  });

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedKeys = await listApiKeys();
      setKeys(fetchedKeys);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load API keys.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreateKeySubmit: SubmitHandler<ApiKeyFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await createApiKey(data.name, data.permissions);
      if (result.success && result.data) {
        setNewlyCreatedKey({ id: result.data.keyId, token: result.data.apiKey, name: data.name, prefix: result.data.prefix });
        // Do not close modal here, it changes content
        // setShowCreateModal(false); // Keep modal open to show the key
        form.reset();
        fetchKeys(); // Refresh the list in the background
      } else {
        toast({ variant: 'destructive', title: 'Creation Failed', description: result.message || 'Could not create API key.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      const result = await revokeApiKey(keyId);
      if (result.success) {
        toast({ title: 'API Key Revoked', description: result.message });
        fetchKeys(); // Refresh list
      } else {
        toast({ variant: 'destructive', title: 'Revoke Failed', description: result.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not revoke API key.' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: 'Copied!', description: 'API key copied to clipboard.' }))
      .catch(() => toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy to clipboard.' }));
  };
  
  const resetCreateModal = () => {
    form.reset();
    setNewlyCreatedKey(null);
    setShowCreateModal(false);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'PPp'); // e.g., Jun 10, 2024, 10:00 AM
      }
      return 'Invalid Date';
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  const formatExpiryDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'PP'); // e.g., Jun 10, 2024
      }
      return 'Invalid Date';
    } catch (e) {
      return 'Invalid Date';
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/integrations">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Integrations</span>
              </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-headline font-semibold text-primary mb-1 flex items-center gap-2">
                    <KeyRound className="h-8 w-8" /> API Key Management
                </h1>
                <p className="text-muted-foreground">
                    Manage API keys for programmatic access to Norruva services.
                </p>
            </div>
        </div>
        <Dialog open={showCreateModal} onOpenChange={(open) => { if (!open) resetCreateModal(); else setShowCreateModal(true); }}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            {!newlyCreatedKey ? (
              <>
                <DialogHeader>
                  <DialogTitle className="font-headline">Create New API Key</DialogTitle>
                  <DialogDescription>
                    Assign a name and select permissions for your new API key.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateKeySubmit)} className="space-y-6 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., My Production Server" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permissions"
                      render={() => (
                        <FormItem>
                          <FormLabel>Permissions</FormLabel>
                          <FormDescription>Select the permissions this key will have.</FormDescription>
                          <div className="space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
                            {availablePermissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={permission.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(permission.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), permission.id])
                                              : field.onChange(
                                                (field.value || []).filter(
                                                  (value) => value !== permission.id
                                                )
                                              )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {permission.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline" onClick={resetCreateModal}>Cancel</Button></DialogClose>
                      <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Key
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="font-headline text-accent">API Key Created Successfully!</DialogTitle>
                  <DialogDescription>
                    Your new API key "<span className="font-semibold">{newlyCreatedKey.name}</span>" (prefix: <span className="font-mono text-xs">{newlyCreatedKey.prefix}</span>) has been created.
                    <strong className="block mt-2 text-destructive">Please copy the full API key below and store it securely. You will not be able to see it again.</strong>
                  </DialogDescription>
                </DialogHeader>
                <div className="my-4 p-3 bg-muted rounded-md font-mono text-sm break-all relative">
                  {newlyCreatedKey.token}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => copyToClipboard(newlyCreatedKey.token)}
                    title="Copy API Key"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={resetCreateModal} className="bg-primary hover:bg-primary/90">Close</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Alert variant="default" className="border-primary/30 bg-primary/5 text-primary">
        <Info className="h-5 w-5" />
        <AlertTitle className="font-headline">Important Security Notice</AlertTitle>
        <AlertDescription>
          Treat your API keys like passwords. Do not share them publicly or commit them to version control.
          Grant only necessary permissions and revoke keys that are no longer needed or might be compromised. Consider using key expiry and IP restrictions if available.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Your API Keys</CardTitle>
          <CardDescription>Manage and monitor your existing API keys.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading API keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No API keys found. Create one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-sm">{key.prefix}</TableCell>
                    <TableCell>
                      <Badge variant={key.status === 'active' ? 'default' : 'destructive'} className={key.status === 'active' ? 'bg-accent text-accent-foreground' : ''}>
                        {key.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate" title={key.permissions.join(', ')}>
                      {key.permissions.join(', ')}
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(key.createdDate)}</TableCell>
                    <TableCell className="text-xs">{formatDate(key.lastUsedDate)}</TableCell>
                    <TableCell>
                      {key.expiresAt ? (
                        <span className="flex items-center text-xs">
                          <CalendarClock className="mr-1 h-3 w-3 text-muted-foreground"/> {formatExpiryDate(key.expiresAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" title="Edit Key (Placeholder)" disabled>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {key.status === 'active' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Revoke Key"
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will revoke the API key named "{key.name}".
                                It will no longer be able to access Norruva services. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeKey(key.id)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Revoke Key
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
