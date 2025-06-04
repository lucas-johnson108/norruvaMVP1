
// src/app/dashboard/blockchain/analytics/page.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Added this import
import { BarChart3, Zap, Activity, ExternalLink, Layers, Users, Filter } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker'; // Assuming this exists
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import Link from 'next/link'; // Added missing Link import

const mockTransactionData = [
  { date: '2024-07-01', count: 150, type: 'NFT Mint' }, { date: '2024-07-01', count: 80, type: 'Token Stake' },
  { date: '2024-07-02', count: 120, type: 'NFT Mint' }, { date: '2024-07-02', count: 95, type: 'Token Stake' },
  { date: '2024-07-03', count: 180, type: 'NFT Mint' }, { date: '2024-07-03', count: 110, type: 'Token Stake' },
  { date: '2024-07-04', count: 160, type: 'NFT Mint' }, { date: '2024-07-04', count: 70, type: 'Vote Cast' },
  { date: '2024-07-05', count: 200, type: 'NFT Mint' }, { date: '2024-07-05', count: 130, type: 'Token Stake' },
];

const mockActiveWalletsData = [
  { date: '2024-W26', count: 520 }, { date: '2024-W27', count: 580 }, { date: '2024-W28', count: 610 },
  { date: '2024-W29', count: 650 }, { date: '2024-W30', count: 700 },
];

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function BlockchainAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline font-semibold text-primary flex items-center">
                <BarChart3 className="mr-3 h-8 w-8" />Blockchain Analytics
            </h1>
            <CardDescription>Monitor on-chain activity, token metrics, and governance participation.</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <DatePickerWithRange date={timeRange} onDateChange={setTimeRange} className="w-full sm:w-auto"/>
            <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Tx Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="nft_mint">NFT Mints</SelectItem>
                    <SelectItem value="token_stake">Token Stakes</SelectItem>
                    <SelectItem value="governance_vote">Governance Votes</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Transactions (30d)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">12,875</p><p className="text-xs text-muted-foreground">+5.2% from last month</p></CardContent>
        </Card>
         <Card className="shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Wallets (Weekly)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">700</p><p className="text-xs text-muted-foreground">+30 since last week</p></CardContent>
        </Card>
         <Card className="shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg. Gas Price (Gwei)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">35.2</p><p className="text-xs text-muted-foreground">Polygon Mainnet (Mock)</p></CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">DPP NFTs Minted (Total)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">1,589</p><p className="text-xs text-muted-foreground">Across all products</p></CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />Transaction Volume Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockTransactionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={10}/>
              <YAxis fontSize={10}/>
              <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}} />
              <Legend wrapperStyle={{fontSize: '10px'}}/>
              <Bar dataKey="count" name="Transactions" fill={CHART_COLORS[0]} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />Active Wallets (Weekly Trend)
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockActiveWalletsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={10}/>
                        <YAxis fontSize={10}/>
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}} />
                        <Legend wrapperStyle={{fontSize: '10px'}}/>
                        <Line type="monotone" dataKey="count" name="Active Wallets" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{r:3}}/>
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-primary" />External Links
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="#" target="_blank" rel="noopener noreferrer"><Zap className="mr-2 h-4 w-4"/>View on Block Explorer (e.g., PolygonScan - Mock)</Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="#" target="_blank" rel="noopener noreferrer"><Layers className="mr-2 h-4 w-4"/>Smart Contract Audit Reports (Mock)</Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                    <Link href="#" target="_blank" rel="noopener noreferrer"><Filter className="mr-2 h-4 w-4"/>Advanced Analytics Dashboard (Mock)</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

