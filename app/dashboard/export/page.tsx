
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { Download, FileArchive, Settings2, History, Info, FileText, CalendarDays, Filter, ServerCrash, CheckCircle2, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data for recent exports
const mockRecentExports = [
  { id: 'EXP001', date: '2024-05-15', dataType: 'All Product Data', format: 'CSV', status: 'Completed', downloadUrl: '#' },
  { id: 'EXP002', date: '2024-05-10', dataType: 'Compliance Reports (Q1)', format: 'PDF', status: 'Completed', downloadUrl: '#' },
  { id: 'EXP003', date: '2024-05-01', dataType: 'Material Composition', format: 'JSON', status: 'Failed', downloadUrl: null },
  { id: 'EXP004', date: '2024-04-20', dataType: 'Battery Products', format: 'XLSX', status: 'Processing', downloadUrl: null },
];

export default function BulkExportPage() {
  const [dataType, setDataType] = useState('all_products');
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleStartExport = () => {
    setIsExporting(true);
    console.log("Starting export with settings:", { dataType, exportFormat, dateRange, categoryFilter });
    // Simulate API call
    setTimeout(() => {
      setIsExporting(false);
      alert(`Export started for ${dataType} in ${exportFormat} format. (Placeholder)`);
      // Add to mockRecentExports or refresh list in a real app
    }, 2000);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="default" className="bg-accent text-accent-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><ServerCrash className="mr-1 h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold text-primary mb-2">Bulk Data Export</h1>
        <p className="text-muted-foreground">
          Download your product data, compliance reports, and other information in various formats.
        </p>
      </div>

      {/* Export Configuration Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Settings2 className="text-primary h-6 w-6" /> Configure Your Export
          </CardTitle>
          <CardDescription>
            Select the data, format, and apply filters for your bulk export.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="data-type">Data to Export</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger id="data-type" aria-label="Data to Export">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_products">All Product Data</SelectItem>
                  <SelectItem value="compliance_reports">Compliance Reports</SelectItem>
                  <SelectItem value="material_composition">Material Composition Data</SelectItem>
                  <SelectItem value="audit_logs">Audit Logs</SelectItem>
                  <SelectItem value="user_data">User Data (Admin)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format" aria-label="Export Format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                  <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf_summary">PDF Summary (Reports only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Filter className="h-4 w-4 text-muted-foreground" />Optional Filters</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <Label htmlFor="date-range-export" className="flex items-center gap-1"><CalendarDays className="h-4 w-4 text-muted-foreground"/>Date Range (for time-sensitive data)</Label>
               <DatePickerWithRange date={dateRange} onDateChange={setDateRange} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Product Category (if applicable)</Label>
              <Input 
                id="category-filter" 
                placeholder="e.g., Electronics, Batteries" 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)} 
              />
            </div>
          </div>
          
          <Button onClick={handleStartExport} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileArchive className="mr-2 h-4 w-4" />}
            {isExporting ? 'Processing Export...' : 'Start Export'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Exports Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <History className="text-primary h-6 w-6" /> Export History
          </CardTitle>
          <CardDescription>
            View the status of your recent bulk exports and download completed files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Export ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecentExports.length > 0 ? mockRecentExports.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-medium">{exp.id}</TableCell>
                  <TableCell>{exp.date}</TableCell>
                  <TableCell>{exp.dataType}</TableCell>
                  <TableCell>{exp.format.toUpperCase()}</TableCell>
                  <TableCell>{getStatusBadge(exp.status)}</TableCell>
                  <TableCell className="text-right">
                    {exp.status === 'Completed' && exp.downloadUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={exp.downloadUrl} download>
                          <Download className="mr-1 h-4 w-4" /> Download
                        </a>
                      </Button>
                    ) : exp.status === 'Failed' ? (
                       <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                          View Error (Placeholder)
                       </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No recent export jobs found.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Information Section */}
      <Alert className="border-primary/30 bg-primary/5">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-headline text-primary">How Bulk Export Works</AlertTitle>
        <AlertDescription className="text-primary/80">
          Bulk exports are processed in the background. Depending on the amount of data, this may take some time.
          You will be notified once your export is ready for download. Completed export files will be available for 7 days.
          For very large datasets, consider applying filters to reduce processing time.
        </AlertDescription>
      </Alert>

      <div className="mt-8">
        <Image src="https://placehold.co/1200x300.png" alt="Data export visual concept" width={1200} height={300} className="rounded-lg" data-ai-hint="data export files"/>
      </div>
    </div>
  );
}
