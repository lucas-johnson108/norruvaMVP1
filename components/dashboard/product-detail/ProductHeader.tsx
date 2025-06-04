
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
// Import the Product type from the page component if it's complex, or define a simpler one here
import type { Product } from '@/app/dashboard/products/edit/[productId]/page';

interface ProductHeaderProps {
  product: Product | null;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ product }) => {
  if (!product) return null;

  return (
    <div className="mb-6 p-4 bg-card rounded-lg shadow">
      <div className="flex items-start sm:items-center gap-4 mb-4 flex-col sm:flex-row">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Products</span>
          </Link>
        </Button>
        {product.imageUrl && (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md border overflow-hidden flex-shrink-0">
            <Image 
              src={product.imageUrl} 
              alt={product.name} 
              layout="fill" 
              objectFit="cover" 
              data-ai-hint="product thumbnail"
            />
          </div>
        )}
        <div className="flex-grow">
          <h1 className="text-2xl font-headline font-semibold text-primary">{product.name}</h1>
          <p className="text-sm text-muted-foreground">GTIN: {product.gtin} | Brand: {product.brand} | Model: {product.model}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => alert('Request Verification Clicked (Mock)')}>Request Verification</Button>
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => alert('Save Changes Clicked (Mock)')}>Save Changes</Button>
      </div>
    </div>
  );
};

export default ProductHeader;
