
"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { submitForVerificationAction, processVerificationAction } from '@/app/actions/products';
import type { Product } from '@/app/dashboard/products/edit/[productId]/page';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Clock, Edit, Send, Info, MessageSquare, XSquare, CheckSquare, History, Loader2, ListChecks, UserCheck, FileWarning, Users2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { UserRole } from '@/app/dashboard/products/edit/[productId]/page';

interface VerificationTabProps {
  product: Product | null;
  currentUserRole: UserRole;
  refreshProductData: () => void;
}

const StatusSummaryCard: React.FC<{ productStatus: Product['dppStatus'], userRole: UserRole, productName: string }> = ({ productStatus, userRole, productName }) => {
  let title = "";
  let description = "";
  let icon: React.ElementType = Info;
  let alertVariant: "default" | "destructive" | "success" | "warning" = "default";

  switch (productStatus) {
    case 'Draft':
    case 'Incomplete':
      if (userRole === 'manufacturer') {
        title = "Action Required: Complete DPP Data";
        description = `The Digital Product Passport for "${productName}" is currently a draft or incomplete. Please fill in all required information from other tabs, then submit for verification from this tab.`;
        icon = Edit;
        alertVariant = 'default';
      } else {
        title = "DPP In Progress";
        description = `The Digital Product Passport for "${productName}" is currently being drafted or completed by the manufacturer.`;
        icon = Edit;
        alertVariant = 'default';
      }
      break;
    case 'Pending Verification':
      if (userRole === 'verifier') {
        title = "Action Required: Review Product";
        description = `"${productName}" is awaiting your verification. Please review the submitted data and documents, then approve, reject, or request changes using the actions below.`;
        icon = UserCheck;
        alertVariant = 'warning';
      } else {
        title = "Awaiting Verification";
        description = `The DPP for "${productName}" has been submitted and is currently awaiting review by a verifier. No action required from your side at this moment.`;
        icon = Clock;
        alertVariant = 'default';
      }
      break;
    case 'Changes Requested':
      if (userRole === 'manufacturer') {
        title = "Action Required: Address Verifier Feedback";
        description = `The verifier has requested changes for "${productName}". Please review the notes in the verification log below, update the product data accordingly via other tabs, and then resubmit for verification from this tab.`;
        icon = FileWarning;
        alertVariant = 'warning';
      } else {
        title = "Changes Requested from Manufacturer";
        description = `Changes have been requested from the manufacturer for the DPP of "${productName}". Awaiting their updates.`;
        icon = MessageSquare;
        alertVariant = 'default';
      }
      break;
    case 'Complete':
      title = "DPP Verified & Complete";
      description = `The Digital Product Passport for "${productName}" has been successfully verified and is marked as complete. No further action is typically required for verification.`;
      icon = ShieldCheck;
      alertVariant = 'success';
      break;
    case 'Pending Supplier':
      title = "Awaiting Supplier Data";
      description = `The DPP for "${productName}" is currently awaiting data contribution from one or more suppliers. The manufacturer may need to follow up with their supply chain.`;
      icon = Users2;
      alertVariant = 'default';
      break;
    default:
      title = "Current Status Unknown";
      description = "The verification status of this product's DPP is not determined or is in an intermediate state.";
      icon = Info;
      alertVariant = 'default';
  }

  let alertClasses = "border-primary/30 bg-primary/5 text-primary";
  if (alertVariant === 'warning') alertClasses = "border-yellow-500/50 bg-yellow-500/10 text-yellow-700";
  if (alertVariant === 'success') alertClasses = "border-accent/50 bg-accent/10 text-accent";
  if (alertVariant === 'destructive') alertClasses = "border-destructive/50 bg-destructive/10 text-destructive";


  return (
    <Alert className={alertClasses}>
      <icon.type className={`h-5 w-5 !${alertVariant === 'success' ? 'text-accent' : alertVariant === 'warning' ? 'text-yellow-600' : alertVariant === 'destructive' ? 'text-destructive' : 'text-primary'}`} />
      <AlertTitle className="font-semibold text-base">{title}</AlertTitle>
      <AlertDescription className="text-sm">
        {description}
      </AlertDescription>
    </Alert>
  );
};


const VerificationTab: React.FC<VerificationTabProps> = ({ product, currentUserRole, refreshProductData }) => {
  const { toast } = useToast();
  const [verifierNotes, setVerifierNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionBeingProcessed, setActionBeingProcessed] = useState<string | null>(null);


  useEffect(() => {
    setVerifierNotes(''); 
  }, [product]);


  const handleSubmission = async () => {
    if (!product) return;
    setIsProcessing(true);
    setActionBeingProcessed('submit');
    // In a real app, get actual userId from auth context
    const result = await submitForVerificationAction(product.id, "mockManufacturerUserId");
    if (result.success) {
      toast({ title: "Submitted for Verification", description: result.message });
      refreshProductData();
    } else {
      toast({ variant: "destructive", title: "Submission Failed", description: result.message });
    }
    setIsProcessing(false);
    setActionBeingProcessed(null);
  };

  const handleVerifierDecision = async (decision: 'approve' | 'reject' | 'request_changes') => {
    if (!product) return;
    setIsProcessing(true);
    setActionBeingProcessed(decision);
     // In a real app, get actual verifierId from auth context
    const result = await processVerificationAction(product.id, decision, verifierNotes, "mockVerifierUserId");
    if (result.success) {
      toast({ title: `Action: ${decision.replace('_', ' ')}`, description: result.message });
      refreshProductData();
      setVerifierNotes('');
    } else {
      toast({ variant: "destructive", title: "Action Failed", description: result.message });
    }
    setIsProcessing(false);
    setActionBeingProcessed(null);
  };

  const getStatusBadge = (status: Product['dppStatus']) => {
    switch (status) {
      case 'Complete':
        return <Badge className="bg-accent text-accent-foreground"><ShieldCheck className="mr-1 h-3 w-3" />Complete & Verified</Badge>;
      case 'Incomplete':
         return <Badge variant="outline"><Edit className="mr-1 h-3 w-3" />Draft / Incomplete</Badge>;
      case 'Pending Supplier':
          return <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 border-blue-500/50"><Users2 className="mr-1 h-3 w-3" />Pending Supplier</Badge>;
      case 'Pending Verification':
        return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-600 border-yellow-500/50"><Clock className="mr-1 h-3 w-3" />Pending Verification</Badge>;
      case 'Changes Requested':
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 border-orange-500/50"><FileWarning className="mr-1 h-3 w-3" />Changes Requested</Badge>;
       case 'Draft':
        return <Badge variant="outline"><Edit className="mr-1 h-3 w-3" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!product) return <p>Loading verification details...</p>;

  const canManufacturerSubmit = currentUserRole === 'manufacturer' && (product.dppStatus === 'Incomplete' || product.dppStatus === 'Changes Requested' || product.dppStatus === 'Draft');
  const canVerifierAct = currentUserRole === 'verifier' && product.dppStatus === 'Pending Verification';

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Verification Workflow</CardTitle>
            {getStatusBadge(product.dppStatus)}
          </div>
          <CardDescription>Manage the verification process for this product's DPP. Current Role: <span className="font-semibold capitalize">{currentUserRole}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusSummaryCard productStatus={product.dppStatus} userRole={currentUserRole} productName={product.name} />

          {canManufacturerSubmit && (
            <Card className="bg-muted/30 p-4 border">
              <h3 className="font-semibold text-md mb-2 text-foreground">Ready to Submit?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ensure all required data for the DPP is complete and accurate before submitting for official verification.
              </p>
              <Button onClick={handleSubmission} disabled={isProcessing} className="bg-primary hover:bg-primary/90">
                {isProcessing && actionBeingProcessed === 'submit' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                Submit for Verification
              </Button>
            </Card>
          )}

          {canVerifierAct && (
             <Card className="bg-blue-500/5 border-blue-500/20 p-4">
              <h3 className="font-semibold text-md mb-3 text-blue-700 flex items-center"><UserCheck className="mr-2 h-5 w-5"/>Verifier Actions</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="verifierNotes" className="text-sm">Notes / Reason for Decision:</Label>
                  <Textarea
                    id="verifierNotes"
                    value={verifierNotes}
                    onChange={(e) => setVerifierNotes(e.target.value)}
                    placeholder="Provide feedback or justification for your decision..."
                    className="mt-1 min-h-[80px] resize-y"
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleVerifierDecision('request_changes')} disabled={isProcessing} className="border-orange-500 text-orange-600 hover:bg-orange-500/10">
                    {isProcessing && actionBeingProcessed === 'request_changes' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquare className="mr-2 h-4 w-4"/>} Request Changes
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleVerifierDecision('reject')} disabled={isProcessing}>
                     {isProcessing && actionBeingProcessed === 'reject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XSquare className="mr-2 h-4 w-4"/>} Reject
                  </Button>
                  <Button onClick={() => handleVerifierDecision('approve')} disabled={isProcessing} className="bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
                    {isProcessing && actionBeingProcessed === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckSquare className="mr-2 h-4 w-4"/>} Approve
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><History className="mr-2 h-5 w-5 text-primary"/>Verification History</CardTitle>
          <CardDescription>Log of all verification events for this product.</CardDescription>
        </CardHeader>
        <CardContent>
          {product.verificationLog && product.verificationLog.length > 0 ? (
            <Accordion type="single" collapsible className="w-full" defaultValue={product.verificationLog.length > 0 ? `log-${product.verificationLog.length -1}` : undefined}>
              {product.verificationLog.slice().reverse().map((log, index) => (
                <AccordionItem value={`log-${index}`} key={index} className="border-b last:border-b-0">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    <div className="flex justify-between items-center w-full">
                        <span className="font-medium text-foreground">{log.event}</span>
                        <span className="text-xs text-muted-foreground">by {log.verifier} - {format(parseISO(log.date), 'PPp')}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground px-4 py-3 bg-muted/30 rounded-b-md">
                    {log.notes ? <pre className="whitespace-pre-wrap font-sans leading-relaxed">Notes: {log.notes}</pre> : <p className="italic">No additional notes for this event.</p>}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No verification history found for this product.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationTab;

