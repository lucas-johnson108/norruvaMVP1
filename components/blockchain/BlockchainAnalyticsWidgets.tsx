
// src/components/blockchain/BlockchainAnalyticsWidgets.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Zap, Layers, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

interface SimpleChartData {
  name: string;
  value: number;
}

interface BlockchainAnalyticsWidgetsProps {
  // Props to pass in actual data later
  totalTransactions?: number;
  activeWallets?: number;
  nftMintVolume?: SimpleChartData[];
  tokenTransferVolume?: SimpleChartData[];
}

const mockNftMintData: SimpleChartData[] = [
  { name: 'Jan', value: 120 }, { name: 'Feb', value: 150 }, { name: 'Mar', value: 130 },
  { name: 'Apr', value: 170 }, { name: 'May', value: 200 }, { name: 'Jun', value: 180 },
];
const mockTokenTransferData: SimpleChartData[] = [
  { name: 'Jan', value: 5000 }, { name: 'Feb', value: 6200 }, { name: 'Mar', value: 5500 },
  { name: 'Apr', value: 7000 }, { name: 'May', value: 6800 }, { name: 'Jun', value: 7500 },
];


export default function BlockchainAnalyticsWidgets({
    totalTransactions = 12875, // Default mock data
    activeWallets = 700, // Default mock data
    nftMintVolume = mockNftMintData,
    tokenTransferVolume = mockTokenTransferData
}: BlockchainAnalyticsWidgetsProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Zap className="mr-2 h-4 w-4" /> Total On-Chain Transactions (30d)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-foreground">{totalTransactions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">+5.2% from last month (Mock)</p>
            </CardContent>
        </Card>
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Users className="mr-2 h-4 w-4" /> Active Wallets (Weekly)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-foreground">{activeWallets.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">+30 since last week (Mock)</p>
            </CardContent>
        </Card>

      <Card className="shadow-sm md:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline text-md flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> DPP NFT Mint Volume (Monthly)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nftMintVolume}>
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}}/>
              <Bar dataKey="value" name="NFTs Minted" fill="hsl(var(--chart-1))" radius={[3,3,0,0]} barSize={20}/>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm md:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline text-md flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> NORU Token Transfer Volume (Monthly)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tokenTransferVolume}>
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}}/>
              <Line type="monotone" dataKey="value" name="Volume" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
