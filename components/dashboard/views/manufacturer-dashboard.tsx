
"use client";
import React, { useState, useEffect, useCallback } from 'react'; 
import Link from 'next/link'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'; 
import { PlusCircle, Search, Edit, Trash2, Eye, FileUp, Info, Send, AlertTriangle, CheckCircle2, BarChart3, Users, Settings, Activity, Filter, ExternalLink, MessageSquare, Layers, Loader2, Clock } from 'lucide-react'; 
import type { MockUser } from '@/app/dashboard/page.tsx';
import { listProductsAction, type MockProduct as Product } from '@/app/actions/products'; 
import { useToast } from '@/hooks/use-toast'; 
import { format, parseISO } from 'date-fns'; 

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];


export default function ManufacturerDashboard({ user }: { user: MockUser }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(''); 
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProductsForDashboard = useCallback(async () => {
    if (!user || !user.companyId) {
        setIsLoading(false);
        setProducts([]);
        return;
    }
    setIsLoading(true);
    try {
        const result = await listProductsAction(user.companyId);
        if (result.success && Array.isArray(result.data)) {
            setProducts(result.data);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load manufacturer products.' });
            setProducts([]);
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while fetching products.' });
        setProducts([]);
    } finally {
        setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProductsForDashboard();
  }, [fetchProductsForDashboard]);


  const recentProducts = products.slice(0, 3);

  const dppStatusCounts = products.reduce((acc, p) => {
    acc[p.dppStatus] = (acc[p.dppStatus] || 0) + 1;
    return acc;
  }, {} as Record<Product['dppStatus'], number>);

  const totalProducts = products.length;
  const dppsCompleteCount = dppStatusCounts['Complete'] || 0;
  const pendingSupplierCount = dppStatusCounts['Pending Supplier'] || 0;
  const pendingVerificationCount = dppStatusCounts['Pending Verification'] || 0;
  
  const completionPercentage = totalProducts > 0 ? (dppsCompleteCount / totalProducts) * 100 : 0;

  const pieData = [
    { name: 'Complete', value: dppsCompleteCount, fill: 'hsl(var(--chart-1))' },
    { name: 'Pending (Supplier/Verification)', value: (pendingSupplierCount) + (pendingVerificationCount), fill: 'hsl(var(--chart-2))' },
    { name: 'Needs Action (Draft/Incomplete/Changes Req.)', value: (dppStatusCounts['Incomplete'] || 0) + (dppStatusCounts['Draft'] || 0) + (dppStatusCounts['Changes Requested'] || 0), fill: 'hsl(var(--chart-3))' },
  ].filter(item => item.value > 0); 
  
  const carbonFootprintData = products
    .filter(p => p.carbonFootprint !== undefined && p.carbonFootprint !== null)
    .map(p => ({ name: p.name.substring(0,15) + (p.name.length > 15 ? "..." : ""), carbonFootprint: p.carbonFootprint as number }))
    .sort((a,b) => b.carbonFootprint - a.carbonFootprint) 
    .slice(0,5); 


  const getStatusBadge = (status: Product['dppStatus']) => {
    switch (status) {
      case 'Complete':
        return <Badge className="bg-accent text-accent-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Complete</Badge>;
      case 'Incomplete':
      case 'Draft':
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />{status}</Badge>;
      case 'Pending Supplier':
        return <Badge variant="secondary" className="bg-primary/70 text-primary-foreground"><Users className="mr-1 h-3 w-3" />Pending Supplier</Badge>;
      case 'Pending Verification':
        return <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 border-purple-500/50"><Layers className="mr-1 h-3 w-3" />Pending Verification</Badge>;
      case 'Changes Requested':
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 border-orange-500/50"><AlertTriangle className="mr-1 h-3 w-3" />Changes Req.</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRequestSupplierData = (productId: string) => {
    alert(`Request data from supplier for product ${productId} (Placeholder)`);
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Welcome, {user.name}! Manage your products and their Digital Product Passports for {user.companyName}.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Activity className="absolute right-4 top-4 h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
             <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary" asChild>
                <Link href="/dashboard/products">View All Products</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">DPPs Complete</CardTitle>
            <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{dppsCompleteCount}</div>
            <Progress value={completionPercentage} className="mt-1 h-2" indicatorClassName={completionPercentage === 100 ? "bg-accent" : "bg-primary"}/>
            <p className="text-xs text-muted-foreground mt-1">{completionPercentage.toFixed(1)}% of products have complete DPPs</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Supplier Data</CardTitle>
            <Users className="absolute right-4 top-4 h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingSupplierCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting Verification</CardTitle>
            <Layers className="absolute right-4 top-4 h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{pendingVerificationCount}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <CardTitle className="font-headline">Quick View: Recent Products</CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                 <Button variant="outline" size="sm" onClick={() => alert("Bulk upload clicked (Placeholder)")} className="flex-1 md:flex-none"><FileUp className="mr-2 h-4 w-4"/>Bulk Upload</Button>
                 <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1 md:flex-none" asChild>
                    <Link href="/dashboard/products/create">
                        <PlusCircle className="mr-2 h-4 w-4"/>Add New Product
                    </Link>
                 </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
                <div className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto"/></div>
            ) : recentProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>DPP Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild><Button variant="ghost" size="icon" className="ml-1 h-5 w-5"><Info className="h-3 w-3 text-muted-foreground"/></Button></TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">
                              <p>ID: {product.id} | Category: {product.category}</p>
                              <p>Carbon Footprint: {product.carbonFootprint ?? 'N/A'} kg CO2e</p>
                              <p>Recyclability: {product.recyclabilityScore ?? 'N/A'}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{getStatusBadge(product.dppStatus)}</TableCell>
                      <TableCell className="text-xs">{format(parseISO(product.lastUpdated), 'PP')}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" title="View Details" asChild>
                           <Link href={`/dashboard/products/edit/${product.id}`}>
                            <Eye className="h-4 w-4"/>
                           </Link>
                        </Button>
                        {product.dppStatus === 'Pending Supplier' && (
                          <Button variant="outline" size="sm" onClick={() => handleRequestSupplierData(product.id)} className="h-8 px-2 py-1 text-xs"><Send className="mr-1 h-3 w-3"/>Request</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-10">No products found for your company. Add one to get started!</p>
            )}
             <div className="p-4 text-right">
                <Button variant="link" size="sm" asChild>
                    <Link href="/dashboard/products">View All Products</Link>
                </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary"/>DPP Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend iconSize={10} wrapperStyle={{fontSize: '10px'}}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground h-full flex items-center justify-center">No data for status overview.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/>Collaboration Hub</CardTitle>
              <CardDescription>Recent supplier interactions and data requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="p-2 bg-muted/50 rounded-md">Request sent to "BatteryCo" for "EcoSmart Refrigerator X1000" battery specs. Status: <span className="font-semibold text-primary">Pending</span></li>
                <li className="p-2 bg-muted/50 rounded-md">Data received from "FrameWorks Inc." for "Modular Office Desk System". Status: <span className="font-semibold text-accent">Complete</span></li>
              </ul>
              <Button variant="link" size="sm" className="mt-2 text-primary">View All Requests</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><ExternalLink className="h-5 w-5 text-primary"/>Product Carbon Footprint Analysis (Top 5)</CardTitle>
          <CardDescription>Overview of carbon footprints for your top products.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          {carbonFootprintData.length > 0 ? (
            <ResponsiveContainer>
              <RechartsBarChart data={carbonFootprintData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                <XAxis type="number" domain={[0, 'dataMax + 50']} unit=" kgCO2e" fontSize={10}/>
                <YAxis dataKey="name" type="category" width={120} interval={0} fontSize={10}/>
                <RechartsTooltip />
                <Legend wrapperStyle={{fontSize: '10px'}}/>
                <Bar dataKey="carbonFootprint" name="Carbon Footprint (kg CO2e)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15}/>
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground h-full flex items-center justify-center">No carbon footprint data available for charts.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

