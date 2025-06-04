
"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Layers, BarChart3, Activity } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  dppStatus: string;
  dppCompletion: number;
  complianceStatus: string;
  carbonFootprint?: number;
  recyclability?: number;
}

interface OverviewTabProps {
  product: Product | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ product }) => {
  if (!product) return <p>Loading product overview...</p>;

  const getStatusBadge = (status: string, type: 'dpp' | 'compliance') => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let icon = <Activity className="mr-1 h-3 w-3" />;
    let textClass = "text-foreground";

    if (type === 'dpp') {
        if (status === 'Complete') { variant = "default"; icon = <CheckCircle2 className="mr-1 h-3 w-3" />; textClass="bg-accent text-accent-foreground"; }
        else if (status === 'Pending Supplier') { variant = "secondary"; icon = <Layers className="mr-1 h-3 w-3" />; textClass="bg-blue-100 text-blue-700"; }
        else if (status === 'Pending Verification') { variant = "secondary"; icon = <Clock className="mr-1 h-3 w-3" />; textClass="bg-yellow-100 text-yellow-700"; }
        else { variant = "destructive"; icon = <AlertTriangle className="mr-1 h-3 w-3" />; }
    } else if (type === 'compliance') {
        if (status === 'Compliant') { variant = "default"; icon = <CheckCircle2 className="mr-1 h-3 w-3" />; textClass="bg-accent text-accent-foreground"; }
        else if (status === 'Pending Review') { variant = "secondary"; icon = <Clock className="mr-1 h-3 w-3" />; textClass="bg-yellow-100 text-yellow-700"; }
        else { variant = "destructive"; icon = <AlertTriangle className="mr-1 h-3 w-3" />; }
    }
    return <Badge variant={variant} className={textClass}>{icon}{status}</Badge>;
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Product Overview: {product.name}</CardTitle>
          <CardDescription>Key metrics and status for this Digital Product Passport.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">DPP Completion</h4>
            <Progress value={product.dppCompletion} className="h-3" />
            <p className="text-sm text-muted-foreground">{product.dppCompletion}% complete</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">DPP Status</h4>
            {getStatusBadge(product.dppStatus, 'dpp')}
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Compliance Status</h4>
             {getStatusBadge(product.complianceStatus, 'compliance')}
          </div>
           <div className="space-y-1">
            <h4 className="font-medium">Carbon Footprint</h4>
            <p className="text-lg font-semibold">{product.carbonFootprint ?? 'N/A'} kg CO₂e</p>
          </div>
           <div className="space-y-1">
            <h4 className="font-medium">Recyclability Score</h4>
            <p className="text-lg font-semibold">{product.recyclability ?? 'N/A'}%</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Recent Activity (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">List of recent changes, verification steps, or alerts related to this DPP.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
