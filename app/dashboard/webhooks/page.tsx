
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  listWebhooks,
  createWebhook,
  updateWebhook, // Import new action
  updateWebhookStatus,
  deleteWebhook,
  testWebhook,
  type WebhookEntry,
  type WebhookFormValues as ActionWebhookFormValues, // Use type from action
} from '@/app/actions/webhooks';
import { 
  PlusCircle, 
  Webhook as WebhookIcon, 
  Trash2, 
  ClipboardCopy,
  Edit2,
  PlayCircle,
  Power,
  PowerOff,
  ShieldAlert,
  Loader2,
  ServerCrash,
  CheckCircle2,
  Info,
  ArrowLeft 
} from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Use the form schema and type from the server action
const webhookFormSchemaClient = z.object({
  id: z.string().optional(), 
  url: z.string().url({ message: "Please enter a valid HTTPS URL." }).startsWith("https://", { message: "URL must start with https://"}),
  description: z.string().min(5, "Description must be at least 5 characters.").max(200, "Description must be 200 characters or less."),
  events: z.array(z.string()).min(1, "Please select at least one event to subscribe to."),
});

type WebhookFormValuesClient = z.infer<typeof webhookFormSchemaClient>;


const availableWebhookEvents = [
  { id: 'product.created', label: 'Product Created' },
  { id: 'product.updated', label: 'Product Updated' },
  { id: 'product.deleted', label: 'Product Deleted' },
  { id: 'verification.requested', label: 'Verification Requested' },
  { id: 'verification.completed', label: 'Verification Completed' },
  { id: 'verification.failed', label: 'Verification Failed' },
  { id: 'compliance.status_changed', label: 'Compliance Status Changed' },
];


interface TestResult {
  success: boolean;
  message: string;
  statusCode?: number;
  responseBody?: string;
}

export default function WebhooksPage() {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpsertModal, setShowUpsertModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEntry | null>(null);
  
  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(null);
  const [webhookToTest, setWebhookToTest] = useState<WebhookEntry | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const form = useForm<WebhookFormValuesClient>({
    resolver: zodResolver(webhookFormSchemaClient),
    defaultValues: {
      id: undefined,
      url: '',
      description: '',
      events: [],
    },
  });

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedWebhooks = await listWebhooks();
      setWebhooks(fetchedWebhooks);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load webhooks.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleOpenUpsertModal = (webhook?: WebhookEntry) => {
    setNewlyCreatedSecret(null); 
    if (webhook) {
      setEditingWebhook(webhook);
      form.reset({
        id: webhook.id,
        url: webhook.url,
        description: webhook.description,
        events: webhook.events,
      });
    } else {
      setEditingWebhook(null);
      form.reset({ id: undefined, url: '', description: '', events: [] });
    }
    setShowUpsertModal(true);
  };

  const handleUpsertSubmit: SubmitHandler<WebhookFormValuesClient> = async (data) => {
    setIsSubmitting(true);
    const payload: Omit<ActionWebhookFormValues, 'id'> = { // Use action type, omit id for creation
      url: data.url,
      description: data.description,
      events: data.events,
    };

    try {
      let result;
      if (editingWebhook && data.id) { // If editingWebhook and id are present, it's an update
        result = await updateWebhook(data.id, payload);
        if (result.success) {
          toast({ title: 'Webhook Updated', description: result.message });
          fetchWebhooks();
          closeUpsertModalAndReset(); // Close modal on successful update
        } else {
          toast({ variant: 'destructive', title: 'Update Failed', description: result.message || 'Could not update webhook.' });
        }
      } else { // Otherwise, it's a creation
        result = await createWebhook(payload);
        if (result.success && result.data) {
          setNewlyCreatedSecret(result.data.secret); 
          toast({ title: 'Webhook Created', description: result.message });
          fetchWebhooks(); 
          // Don't close modal on create, show secret
        } else {
          toast({ variant: 'destructive', title: 'Creation Failed', description: result.message || 'Could not create webhook.' });
        }
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
      if (!editingWebhook && !newlyCreatedSecret) { // Reset form only if not showing secret or not editing
         // form.reset({ url: '', description: '', events: [] }); // This is handled by closeUpsertModalAndReset
      }
    }
  };
  
  const closeUpsertModalAndReset = () => {
    setShowUpsertModal(false);
    setEditingWebhook(null);
    form.reset({id: undefined, url: '', description: '', events: [] }); 
    setNewlyCreatedSecret(null);
  };


  const handleToggleStatus = async (webhookId: string, currentStatus: 'active' | 'inactive' | 'failed_to_deliver') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const result = await updateWebhookStatus(webhookId, newStatus);
      if (result.success) {
        toast({ title: 'Status Updated', description: result.message });
        fetchWebhooks();
      } else {
        toast({ variant: 'destructive', title: 'Update Failed', description: result.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update webhook status.' });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      const result = await deleteWebhook(webhookId);
      if (result.success) {
        toast({ title: 'Webhook Deleted', description: result.message });
        fetchWebhooks();
      } else {
        toast({ variant: 'destructive', title: 'Delete Failed', description: result.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete webhook.' });
    }
  };
  
  const handleTestWebhook = async (webhook: WebhookEntry) => {
    setWebhookToTest(webhook);
    setTestResult(null);
    setIsTesting(true);
    try {
      const result = await testWebhook(webhook.id);
      if (result.success && result.data) {
        setTestResult(result.data);
      } else {
        setTestResult({ success: false, message: result.message || "Test failed to initiate."});
      }
      fetchWebhooks(); 
    } catch (error) {
       setTestResult({ success: false, message: "An error occurred while testing."});
    } finally {
      setIsTesting(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: 'Copied!', description: 'Signing secret copied to clipboard.' }))
      .catch(() => toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy to clipboard.' }));
  };

  const getStatusBadge = (status: WebhookEntry['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-accent text-accent-foreground"><CheckCircle2 className="mr-1 h-3 w-3"/>Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><PowerOff className="mr-1 h-3 w-3"/>Inactive</Badge>;
      case 'failed_to_deliver':
        return <Badge variant="destructive"><ServerCrash className="mr-1 h-3 w-3"/>Delivery Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const maskUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.hostname}/...${parsedUrl.pathname.slice(-10)}`;
    } catch {
      return url.length > 30 ? url.slice(0, 15) + "..." + url.slice(-15) : url;
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
            <h1 className="text-3xl font-headline font-semibold text-primary mb-2 flex items-center gap-2">
              <WebhookIcon className="h-8 w-8" /> Webhook Management
            </h1>
            <p className="text-muted-foreground">
              Configure endpoints to receive real-time event notifications from Norruva.
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenUpsertModal()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Webhook
        </Button>
      </div>

      <Alert variant="default" className="border-primary/30 bg-primary/5 text-primary">
        <ShieldAlert className="h-5 w-5" />
        <AlertTitle className="font-headline">Webhook Security Best Practices</AlertTitle>
        <AlertDescription>
          Always use HTTPS for your endpoint URLs. Verify webhook signatures using the provided secret to ensure requests originate from Norruva.
          Implement idempotent processing for events to handle potential retries gracefully.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Configured Webhooks</CardTitle>
          <CardDescription>Manage your webhook endpoints and event subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading webhooks...</p>
            </div>
          ) : webhooks.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No webhooks configured. Add one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint URL</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((wh) => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-mono text-sm" title={wh.url}>{maskUrl(wh.url)}</TableCell>
                    <TableCell className="max-w-xs truncate">{wh.description}</TableCell>
                    <TableCell>{getStatusBadge(wh.status)}</TableCell>
                    <TableCell className="text-xs">
                      {wh.events.length > 2 ? `${wh.events.slice(0,2).join(', ')} +${wh.events.length-2} more` : wh.events.join(', ')}
                    </TableCell>
                    <TableCell>{new Date(wh.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        title={wh.status === 'active' ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleStatus(wh.id, wh.status)}
                      >
                        {wh.status === 'active' ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-accent" />}
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit Webhook" onClick={() => handleOpenUpsertModal(wh)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" title="Delete Webhook" className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the webhook endpoint: <br />
                              <span className="font-semibold">{maskUrl(wh.url)}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteWebhook(wh.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button variant="ghost" size="icon" title="Test Webhook" onClick={() => handleTestWebhook(wh)} disabled={isTesting && webhookToTest?.id === wh.id}>
                         {isTesting && webhookToTest?.id === wh.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <PlayCircle className="h-4 w-4 text-blue-500" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showUpsertModal} onOpenChange={(open) => { if (!open) closeUpsertModalAndReset(); else setShowUpsertModal(true); }}>
        <DialogContent className="sm:max-w-lg">
           {!newlyCreatedSecret ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline">{editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}</DialogTitle>
                <DialogDescription>
                  {editingWebhook ? 'Update the webhook details.' : 'Configure the endpoint URL and select events to subscribe to.'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpsertSubmit)} className="space-y-6 py-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endpoint URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/api/webhook" {...field} />
                        </FormControl>
                        <FormDescription>Must be an HTTPS URL.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A short description for this webhook." {...field} className="resize-y"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="events"
                    render={() => (
                      <FormItem>
                        <FormLabel>Subscribed Events</FormLabel>
                        <FormDescription>Select the events you want to receive notifications for.</FormDescription>
                        <div className="space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
                          {availableWebhookEvents.map((event) => (
                            <FormField
                              key={event.id}
                              control={form.control}
                              name="events"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(event.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), event.id])
                                          : field.onChange((field.value || []).filter((value) => value !== event.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{event.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" onClick={closeUpsertModalAndReset}>Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingWebhook ? 'Save Changes' : 'Create Webhook'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          ) : (
             <>
              <DialogHeader>
                <DialogTitle className="font-headline text-accent">Webhook Created Successfully!</DialogTitle>
                <DialogDescription>
                  Your new webhook has been created.
                  <strong className="block mt-2 text-destructive">This is your signing secret. Please copy it and store it securely. You will not be able to see it again.</strong>
                </DialogDescription>
              </DialogHeader>
              <div className="my-4 p-3 bg-muted rounded-md font-mono text-sm break-all relative">
                {newlyCreatedSecret}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => copyToClipboard(newlyCreatedSecret!)}
                  title="Copy Signing Secret"
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={closeUpsertModalAndReset}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!(webhookToTest && testResult)} onOpenChange={() => { if(!(webhookToTest && testResult)) { setWebhookToTest(null); setTestResult(null); }}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Test Result for: <span className="font-mono text-sm">{webhookToTest && maskUrl(webhookToTest.url)}</span></DialogTitle>
             <DialogDescription>
                Status of the simulated test event delivery.
             </DialogDescription>
          </DialogHeader>
          {isTesting && !testResult ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2"/> Sending test event...
            </div>
          ) : testResult ? (
            <div className="space-y-3 py-4 text-sm">
              <div className={`flex items-center p-2 rounded-md ${testResult.success ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                {testResult.success ? <CheckCircle2 className="h-5 w-5 mr-2"/> : <ServerCrash className="h-5 w-5 mr-2"/>}
                <span className="font-semibold">{testResult.success ? 'Success' : 'Failed'}</span>
              </div>
              <p><span className="font-medium">Message:</span> {testResult.message}</p>
              {testResult.statusCode && <p><span className="font-medium">Status Code:</span> {testResult.statusCode}</p>}
              {testResult.responseBody && (
                <div>
                  <p className="font-medium">Response Body:</p>
                  <pre className="mt-1 p-2 bg-muted rounded-md text-xs max-h-40 overflow-auto">{testResult.responseBody}</pre>
                </div>
              )}
            </div>
          ) : null }
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" onClick={() => {setWebhookToTest(null); setTestResult(null);}}>Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Info className="text-primary h-6 w-6"/>Recent Deliveries (Placeholder)</CardTitle>
            <CardDescription>View the status of recent event deliveries to your webhook endpoints.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-8">Webhook delivery logs and retry mechanisms would be shown here in a full implementation.</p>
        </CardContent>
       </Card>
    </div>
  );
}
