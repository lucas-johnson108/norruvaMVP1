
"use client";
import { useState } from 'react';
import ComplianceCheckForm from '@/components/dashboard/compliance-check-form';
import ComplianceReportDisplay from '@/components/dashboard/compliance-report-display';
import { performComplianceCheck, saveComplianceReport } from '@/app/actions/compliance'; // Make sure saveComplianceReport is exported if used directly here
import type { ComplianceCheckOutput } from '@/ai/flows/compliance-check';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Info, ShieldCheck, FileSpreadsheet } from 'lucide-react'; // Changed BarChartIcon
import Image from 'next/image';

export default function CompliancePage() {
  const [report, setReport] = useState<ComplianceCheckOutput | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold text-primary mb-2 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8" /> Compliance Center
        </h1>
        <p className="text-muted-foreground">
          Utilize AI to check product data against compliance standards and view detailed reports.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComplianceCheckForm 
            onComplianceCheck={performComplianceCheck} 
            setReport={setReport}
            setIsLoadingReport={setIsLoadingReport}
          />
        </div>
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><BarChart3 className="text-primary h-6 w-6" />Compliance Snapshot</CardTitle> {/* Changed Icon */}
                <CardDescription>Overview of your product compliance posture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Overall Compliance Rate</p>
                    <p className="text-2xl font-bold text-accent">92.5%</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Checks Last 30d</p>
                    <p className="text-2xl font-bold text-primary">47</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Products with Open Issues</p>
                    <p className="text-2xl font-bold text-destructive">3</p>
                </div>
                 <div className="mt-4">
                    <Image src="https://placehold.co/400x200.png" alt="Compliance summary chart placeholder" width={400} height={200} className="rounded-md" data-ai-hint="compliance chart summary" />
                 </div>
            </CardContent>
        </Card>
      </div>
      
      <ComplianceReportDisplay report={report} isLoading={isLoadingReport} />

      <Card className="mt-8 bg-blue-50 border-blue-200 shadow-sm">
        <CardHeader className="flex flex-row items-start gap-3">
          <FileSpreadsheet className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <CardTitle className="font-headline text-blue-700">Understanding Your Compliance Report</CardTitle>
            <CardDescription className="text-blue-600">
              The AI analyzes product data against specified standards, identifying conformities, non-conformities, and areas needing attention. 
              Evidence paths point to relevant JSON fields in your product data.
              This tool aids compliance efforts and should complement official verification processes. Reports can be saved for your records.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

    </div>
  );
}
