
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import Image from 'next/image';

import { Download, FileText, BarChart3, Activity, AlertTriangle, CheckCircle2, Settings2, CalendarDays, Printer } from 'lucide-react';

// Mock Data
const keyMetricsData = {
  overallCompliance: 92.5,
  productsNeedingAttention: 15,
  reportsGeneratedLastMonth: 28,
  averageTimeToCompliance: '12 days',
};

const complianceStatusData = [
  { name: 'Compliant', value: 1150, fill: 'hsl(var(--chart-1))' },
  { name: 'Pending', value: 80, fill: 'hsl(var(--chart-2))'  },
  { name: 'Non-Compliant', value: 20, fill: 'hsl(var(--chart-3))' },
];

const productsByCategoryData = [
  { category: 'Electronics', count: 500, compliant: 450, issues: 10 },
  { category: 'Batteries', count: 300, compliant: 280, issues: 5 },
  { category: 'Textiles', count: 250, compliant: 240, issues: 3 },
  { category: 'Furniture', count: 200, compliant: 180, issues: 7 },
];

const recentReportsData = [
  { id: 'REP001', name: 'Q1 Compliance Summary', date: '2024-04-01', type: 'Compliance', status: 'Generated' },
  { id: 'REP002', name: 'Electronics Inventory Report', date: '2024-03-15', type: 'Inventory', status: 'Generated' },
  { id: 'REP003', name: 'Monthly Audit Trail', date: '2024-03-01', type: 'Audit', status: 'Pending' },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];


export default function ReportsPage() {
  const [reportType, setReportType] = useState('compliance_overview');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [reportFormat, setReportFormat] = useState('pdf');

  const handleGenerateReport = () => {
    // Placeholder for report generation logic
    alert(`Generating ${reportType} report for ${dateRange} in ${reportFormat} format... (Placeholder)`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold text-primary mb-2">Reporting Center</h1>
        <p className="text-muted-foreground">
          Generate, view, and manage product compliance and inventory reports.
        </p>
      </div>

      {/* Key Metrics Section */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{keyMetricsData.overallCompliance}%</div>
              <p className="text-xs text-muted-foreground">of all active products</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{keyMetricsData.productsNeedingAttention}</div>
              <p className="text-xs text-muted-foreground">products with issues or pending</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Generated (30d)</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetricsData.reportsGeneratedLastMonth}</div>
              <p className="text-xs text-muted-foreground">across all categories</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time to Compliance</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetricsData.averageTimeToCompliance}</div>
              <p className="text-xs text-muted-foreground">for recently verified products</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Generate New Report Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Settings2 className="text-primary h-6 w-6" /> Generate New Report
          </CardTitle>
          <CardDescription>
            Customize and generate detailed reports based on your needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type" aria-label="Report Type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance_overview">Compliance Overview</SelectItem>
                  <SelectItem value="inventory_summary">Inventory Summary</SelectItem>
                  <SelectItem value="material_composition">Material Composition</SelectItem>
                  <SelectItem value="audit_log">Audit Log</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="date-range" aria-label="Date Range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range (Placeholder)</SelectItem>
                </SelectContent>
              </Select>
              {dateRange === 'custom' && (
                <div className="flex gap-2 mt-2">
                  <Input type="date" placeholder="Start Date" aria-label="Start Date"/>
                  <Input type="date" placeholder="End Date" aria-label="End Date"/>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-format">Format</Label>
              <Select value={reportFormat} onValueChange={setReportFormat}>
                <SelectTrigger id="report-format" aria-label="Report Format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerateReport} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            <Download className="mr-2 h-4 w-4" /> Generate Report
          </Button>
        </CardContent>
      </Card>
      
      {/* Visualizations Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><BarChart3 className="text-primary h-5 w-5"/>Compliance Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={complianceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {complianceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><BarChart3 className="text-primary h-5 w-5"/>Products by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={productsByCategoryData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Total Products" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="compliant" name="Compliant" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]}/>
                </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <FileText className="text-primary h-6 w-6" /> Recent Reports
          </CardTitle>
          <CardDescription>
            Access your recently generated reports or view scheduled reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReportsData.length > 0 ? recentReportsData.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 text-xs rounded-full ${report.status === 'Generated' ? 'bg-accent/20 text-accent-foreground' : 'bg-yellow-400/20 text-yellow-700'}`}>
                        {report.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Download Report">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Print Report">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No recent reports found.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       <div className="mt-8">
          <Image src="https://placehold.co/1200x300.png" alt="Reports placeholder banner" width={1200} height={300} className="rounded-lg" data-ai-hint="dashboard charts"/>
      </div>
    </div>
  );
}

    