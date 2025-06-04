
"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, XCircle, AlertTriangle, FileText, Loader2, Info, Save, ListChecks, ExternalLink, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import type { ComplianceCheckOutput } from '@/ai/flows/compliance-check-types';
import { saveComplianceReport } from '@/app/actions/compliance';
import { useToast } from '@/hooks/use-toast';

interface ComplianceReportDisplayProps {
  report: ComplianceCheckOutput | null;
  isLoading: boolean;
}

export default function ComplianceReportDisplay({ report, isLoading }: ComplianceReportDisplayProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveReport = async () => {
    if (!report || report.overallStatus === "Error") {
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Cannot save an invalid or error report.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const result = await saveComplianceReport(report);
      if (result.success) {
        toast({
          title: "Report Saved",
          description: result.message || `Compliance report ${result.reportId || ''} saved successfully.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: result.message || "Could not save the report.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <Card className="mt-6 shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Generating Compliance Report...
          </CardTitle>
          <CardDescription>The AI is analyzing the product data against compliance standards. This may take a moment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-full animate-pulse"></div>
          <div className="mt-6 h-6 bg-muted rounded w-1/4 animate-pulse"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-border p-4 rounded-md mt-2 space-y-3">
              <div className="h-5 bg-muted rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return null; // Don't display anything if there's no report and not loading
  }

  const getOverallStatusVisuals = (status: ComplianceCheckOutput['overallStatus']) => {
    switch (status) {
      case 'Compliant':
        return { icon: <CheckCircle2 className="h-6 w-6 text-accent" />, color: "text-accent", badgeVariant: "default" as const, bgColor: "bg-accent/10" };
      case 'Partially Compliant':
        return { icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />, color: "text-yellow-600", badgeVariant: "secondary" as const, bgColor: "bg-yellow-500/10" };
      case 'Non-Compliant':
        return { icon: <XCircle className="h-6 w-6 text-destructive" />, color: "text-destructive", badgeVariant: "destructive" as const, bgColor: "bg-destructive/10" };
      case 'Error':
        return { icon: <AlertCircle className="h-6 w-6 text-destructive" />, color: "text-destructive", badgeVariant: "destructive"as const, bgColor: "bg-destructive/10" };
      default:
        return { icon: <Info className="h-6 w-6 text-muted-foreground" />, color: "text-muted-foreground", badgeVariant: "outline" as const, bgColor: "bg-muted/10" };
    }
  };

  const getDetailedStatusVisuals = (status: NonNullable<ComplianceCheckOutput['detailedChecks']>[0]['status']) => {
     switch (status) {
      case 'Compliant':
        return { icon: <ThumbsUp className="h-4 w-4 text-accent" />, badgeVariant: "default" as const, className: "text-accent" };
      case 'Non-Compliant':
        return { icon: <ThumbsDown className="h-4 w-4 text-destructive" />, badgeVariant: "destructive" as const, className: "text-destructive"};
      case 'Partially Compliant':
        return { icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />, badgeVariant: "secondary" as const, className: "text-yellow-600"};
      case 'Requires Attention':
        return { icon: <AlertCircle className="h-4 w-4 text-orange-500" />, badgeVariant: "secondary" as const, className: "text-orange-600"};
      case 'Not Assessed':
        return { icon: <Info className="h-4 w-4 text-muted-foreground" />, badgeVariant: "outline" as const, className: "text-muted-foreground"};
      default:
        return { icon: <Info className="h-4 w-4 text-muted-foreground" />, badgeVariant: "outline" as const, className: "text-muted-foreground"};
    }
  };

  const { icon: overallIcon, color: overallColor, badgeVariant: overallBadgeVariant, bgColor: overallBgColor } = getOverallStatusVisuals(report.overallStatus);

  return (
    <Card className="mt-6 shadow-xl">
      <CardHeader className={`p-6 ${overallBgColor} rounded-t-lg`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {overallIcon}
                <CardTitle className={`font-headline text-2xl ${overallColor}`}>{report.overallStatus}</CardTitle>
            </div>
            {report.reportId && <Badge variant="outline" className="text-xs">Report ID: {report.reportId}</Badge>}
        </div>
        <CardDescription className={`mt-2 ${overallColor}`}>{report.summary}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold font-headline text-primary flex items-center gap-2">
                <ListChecks className="h-5 w-5" /> Detailed Checks
            </h3>
            <Button onClick={handleSaveReport} disabled={isSaving || report.overallStatus === "Error"} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Report'}
            </Button>
        </div>

        {report.detailedChecks && report.detailedChecks.length > 0 ? (
          <Accordion type="multiple" className="w-full" defaultValue={report.detailedChecks.map(dc => dc.standard).slice(0,1) /* Expand first item by default */}>
            {report.detailedChecks.map((check, index) => {
              const { icon: detailIcon, badgeVariant: detailBadgeVariant, className: detailColorClass } = getDetailedStatusVisuals(check.status);
              return (
                <AccordionItem value={check.standard || `check-${index}`} key={check.standard || index} className="border-b border-border last:border-b-0">
                  <AccordionTrigger className="hover:no-underline py-4 text-left">
                    <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-base text-foreground flex-1 pr-2">{check.standard}</span>
                        <Badge variant={detailBadgeVariant} className={`ml-auto text-xs ${detailBadgeVariant === 'default' ? 'bg-accent text-accent-foreground': ''}`}>
                            {detailIcon} <span className="ml-1">{check.status}</span>
                        </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3 text-sm">
                    <div className="p-3 bg-muted/50 rounded-md">
                        <p className="font-semibold text-muted-foreground mb-1">Findings:</p>
                        <p className="text-foreground whitespace-pre-line">{check.findings}</p>
                    </div>
                    {check.evidence && check.evidence.length > 0 && (
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="font-semibold text-muted-foreground mb-1">Evidence/References:</p>
                        <ul className="list-disc list-inside pl-1 space-y-1">
                          {check.evidence.map((ev, idx) => (
                            <li key={idx} className="text-foreground font-mono text-xs">
                              {ev}
                              {/* Potential: Add a button to view this path in product data if we had a JSON viewer */}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {check.recommendations && (
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="font-semibold text-muted-foreground mb-1">Recommendations:</p>
                        <p className="text-foreground whitespace-pre-line">{check.recommendations}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-center py-4">No detailed checks available for this report.</p>
        )}
      </CardContent>
    </Card>
  );
}
