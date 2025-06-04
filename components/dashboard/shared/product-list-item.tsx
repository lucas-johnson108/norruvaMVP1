
// This component might not be strictly necessary if tables are used directly,
// but could be useful for more complex list items or if we switch from tables later.
// For now, I'll create a basic structure if it's decided to be used.
// Given the table-based approach in ManufacturerDashboard, this might be less critical for the current pass.
// Creating a placeholder to fulfill the file creation part of the plan.

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Send } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  dppStatus: 'Complete' | 'Incomplete' | 'Pending Supplier' | 'Pending Verification';
  category: string;
  lastUpdated: string;
}

interface ProductListItemProps {
  product: Product;
  onViewDetails: (productId: string) => void;
  onEdit: (productId: string) => void;
  onRequestSupplierData?: (productId: string) => void; // Optional for manufacturer
}

const ProductListItem: React.FC<ProductListItemProps> = ({ 
  product, 
  onViewDetails, 
  onEdit,
  onRequestSupplierData 
}) => {
  
  const getStatusBadgeVariant = () => {
    switch (product.dppStatus) {
      case 'Complete': return 'default'; // Will use accent color via direct styling
      case 'Incomplete': return 'destructive';
      case 'Pending Supplier': return 'secondary'; // Will use primary color via direct styling
      case 'Pending Verification': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColorClass = () => {
     switch (product.dppStatus) {
      case 'Complete': return 'bg-accent text-accent-foreground';
      case 'Pending Supplier': return 'bg-primary/70 text-primary-foreground';
      default: return '';
    }
  }

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {product.id} | Category: {product.category}</p>
          <p className="text-xs text-muted-foreground">Last Updated: {product.lastUpdated}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant()} className={getStatusColorClass()}>{product.dppStatus}</Badge>
          <Button variant="ghost" size="icon" onClick={() => onViewDetails(product.id)} title="View Details"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(product.id)} title="Edit Product"><Edit className="h-4 w-4" /></Button>
          {product.dppStatus === 'Pending Supplier' && onRequestSupplierData && (
            <Button variant="outline" size="sm" onClick={() => onRequestSupplierData(product.id)} title="Request Data from Supplier">
              <Send className="mr-1 h-3 w-3"/> Request Data
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductListItem;
