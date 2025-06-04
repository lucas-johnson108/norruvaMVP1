"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Leaf, Recycle, ShieldCheck, Info, Package, Zap, Thermometer, Tag, CalendarDays, Factory } from 'lucide-react';
import Image from 'next/image';

interface ProductData {
  productId: string;
  basicInfo: {
    name: string;
    brand: string;
    model: string;
  };
  publicData: {
    energyLabel?: string;
    carbonFootprint?: string;
    recyclability?: string;
    warranty?: string;
    origin?: string;
    recyclingInstructions?: string;
    image?: string;
  };
}

interface ProductInfoCardProps {
  product: ProductData | null;
  loading: boolean;
  error?: string | null;
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | null; accent?: boolean }> = ({ icon: Icon, label, value, accent }) => {
  if (!value) return null;
  return (
    <div className="flex items-start space-x-3">
      <Icon className={`h-5 w-5 mt-1 ${accent ? 'text-accent' : 'text-primary'}`} />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default function ProductInfoCard({ product, loading, error }: ProductInfoCardProps) {
  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-1/2 mt-2 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="h-5 w-5 bg-muted rounded-full animate-pulse mt-1"></div>
              <div>
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-40 mt-1 animate-pulse"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-destructive">
        <CardHeader>
          <CardTitle className="font-headline text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Product Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested product could not be found. Please check the ID and try again.</p>
        </CardContent>
      </Card>
    );
  }

  const { basicInfo, publicData } = product;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl overflow-hidden">
      <CardHeader className="bg-secondary/50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="font-headline text-3xl text-primary">{basicInfo.name}</CardTitle>
            <CardDescription className="text-base mt-1">
              {basicInfo.brand} - Model: {basicInfo.model}
            </CardDescription>
          </div>
          {publicData.energyLabel && (
            <Badge variant="outline" className="mt-2 md:mt-0 text-lg py-1 px-3 border-accent text-accent font-bold self-start md:self-center">
              Energy: {publicData.energyLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {publicData.image && (
            <div className="w-full h-64 relative rounded-lg overflow-hidden my-4">
                <Image 
                    src={publicData.image} 
                    alt={basicInfo.name} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint="product item"
                />
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem icon={Package} label="Product ID" value={product.productId} />
          <DetailItem icon={Leaf} label="Carbon Footprint" value={publicData.carbonFootprint} accent />
          <DetailItem icon={Recycle} label="Recyclability" value={publicData.recyclability} accent />
          <DetailItem icon={ShieldCheck} label="Warranty" value={publicData.warranty} />
          <DetailItem icon={Factory} label="Origin" value={publicData.origin} />
        </div>
        
        {publicData.recyclingInstructions && (
          <>
            <Separator className="my-6" />
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center font-headline text-primary">
                <Recycle className="h-5 w-5 mr-2 text-accent" />
                Recycling Information
              </h3>
              <p className="text-muted-foreground leading-relaxed">{publicData.recyclingInstructions}</p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="bg-secondary/30 p-4 text-center">
        <p className="text-xs text-muted-foreground w-full">
          This information is part of the product's Digital Product Passport. For more details, consult partner portals or official documentation.
        </p>
      </CardFooter>
    </Card>
  );
}
