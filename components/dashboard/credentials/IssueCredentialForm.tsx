
// src/components/dashboard/credentials/IssueCredentialForm.tsx
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { issueEbsiCredentialAction, type IssueCredentialActionValues } from '@/app/actions/credentials'; // Import new action

// Zod schema for form validation - matches the action's input schema
const issueCredentialFormSchema = z.object({
  credentialType: z.string().min(3, "Credential type is required (min 3 chars)."),
  subjectDppId: z.string().min(5, "Subject DPP ID is required (min 5 chars)."),
  credentialData: z.string().refine((data) => { // Renamed from credentialDataString to match form field name
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Credential data must be valid JSON." }),
});

type IssueCredentialFormValues = z.infer<typeof issueCredentialFormSchema>;

interface IssueCredentialFormProps {
  onCredentialIssued: () => void; // Callback to refresh parent list
}

export default function IssueCredentialForm({ onCredentialIssued }: IssueCredentialFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IssueCredentialFormValues>({
    resolver: zodResolver(issueCredentialFormSchema),
    defaultValues: {
      credentialType: '',
      subjectDppId: '',
      credentialData: '{}',
    },
  });

  const onSubmit: SubmitHandler<IssueCredentialFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare data for the action, ensuring field names match
      const actionInput: IssueCredentialActionValues = {
        credentialType: data.credentialType,
        subjectDppId: data.subjectDppId,
        credentialDataString: data.credentialData, // Map form field to action field
      };

      const result = await issueEbsiCredentialAction(actionInput);
      
      if (result.success && result.data) {
        toast({ 
          title: "Credential Issued (Mock)", 
          description: result.message || `VC for ${data.subjectDppId} successfully processed.`
        });
        form.reset(); 
        onCredentialIssued(); 
      } else {
        toast({
          variant: "destructive",
          title: "Issuance Failed",
          description: result.message || "Could not issue the credential."
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="credentialType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credential Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., CarbonFootprintAttestation, RoHSCompliance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subjectDppId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject DPP ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter the DPP ID this credential applies to" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="credentialData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credential Data (JSON Snippet)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder='e.g., {"co2_kg": 12.5, "assessment_date": "2024-07-20"}' 
                  className="min-h-[100px] resize-y font-mono text-xs" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Alert variant="default" className="border-primary/30 bg-primary/5 text-primary">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Ensure the credential data adheres to the selected credential type's schema.
            Issuing credentials typically involves signing with your organization's DID. This is a mock interface.
          </AlertDescription>
        </Alert>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Issue Credential
          </Button>
        </div>
      </form>
    </Form>
  );
}
