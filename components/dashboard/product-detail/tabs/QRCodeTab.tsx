
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { QrCode as QrCodeIcon, Download, Settings2, Loader2, ExternalLink, LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product, QRCodeData } from '@/app/dashboard/products/edit/[productId]/page'; // Using Product type from its page
import { functions } from '@/lib/firebase'; // For callable function
import { httpsCallable } from 'firebase/functions';
import { updateProductQRCodeAction } from '@/app/actions/products'; // To update local mock DB if needed directly (though callable should handle)

interface QRCodeTabProps {
  product: Product | null;
  refreshProductData: () => void;
}

type QRCodeSize = 'small' | 'medium' | 'large';

const sizeMap: Record<QRCodeSize, number> = {
  small: 200,
  medium: 300,
  large: 500,
};

// Ensure NEXT_PUBLIC_APP_URL is correctly defined or fallback
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dpp.norruva-demo.com';


export default function QRCodeTab({ product, refreshProductData }: QRCodeTabProps) {
  const { toast } = useToast();
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [digitalLink, setDigitalLink] = useState<string | null>(null);
  const [includeSerialInLink, setIncludeSerialInLink] = useState(true);
  const [currentOptions, setCurrentOptions] = useState<{ size: QRCodeSize; serialNumber?: string }>({
    size: 'medium',
    serialNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [displayGeneratedAt, setDisplayGeneratedAt] = useState<string | null>(null);

  const extractSerialFromLink = (link: string | undefined): string | undefined => {
    if (!link) return undefined;
    const match = link.match(/\/21\/([^/?#]+)/);
    return match && match[1] ? decodeURIComponent(match[1]) : undefined;
  };

  useEffect(() => {
    if (product && product.gtin) {
      let initialSerial = product.serialNumber || '';
      let initialIncludeSerial = true;

      if (product.qrCode?.digitalLink) {
        const serialFromLink = extractSerialFromLink(product.qrCode.digitalLink);
        if (serialFromLink) {
          initialSerial = serialFromLink;
          initialIncludeSerial = true;
        } else {
          initialIncludeSerial = false; // If link exists but no /21/, assume it was GTIN-only
          initialSerial = ''; // Don't default to product.serialNumber if link implies no serial
        }
        setQrCodeDataURL(product.qrCode.dataURL || null);
        setDigitalLink(product.qrCode.digitalLink); // Set the saved digital link
        setDisplayGeneratedAt(product.qrCode.generatedAt ? new Date(product.qrCode.generatedAt).toLocaleString() : null);
      } else {
        // No saved QR code, default to including serial if product has one
        initialIncludeSerial = !!product.serialNumber;
        initialSerial = product.serialNumber || '';
        setQrCodeDataURL(null);
        setDigitalLink(null);
        setDisplayGeneratedAt(null);
      }
      
      setIncludeSerialInLink(initialIncludeSerial);
      setCurrentOptions(prev => ({ ...prev, serialNumber: initialSerial }));

    } else {
      setQrCodeDataURL(null);
      setDigitalLink(null);
      setCurrentOptions({ size: 'medium', serialNumber: '' });
      setIncludeSerialInLink(true);
      setDisplayGeneratedAt(null);
    }
  }, [product]);

  const generateCurrentDigitalLink = useCallback(() => {
    if (!product || !product.gtin) return null;
    const serialToUse = includeSerialInLink ? (currentOptions.serialNumber?.trim() || '') : '';
    return `${APP_BASE_URL}/01/${product.gtin}${serialToUse ? `/21/${encodeURIComponent(serialToUse)}` : ''}`;
  }, [product, product?.gtin, currentOptions.serialNumber, includeSerialInLink, APP_BASE_URL]);

  useEffect(() => {
    // Update digitalLink preview whenever relevant options change, but only if there's no saved QR
    // If there *is* a saved QR, digitalLink is set from product.qrCode.digitalLink
    if (!product?.qrCode?.digitalLink || (product?.qrCode?.digitalLink && !qrCodeDataURL)) {
         const newLink = generateCurrentDigitalLink();
         setDigitalLink(newLink);
    }
  }, [generateCurrentDigitalLink, product?.qrCode?.digitalLink, qrCodeDataURL]);


  const handleGenerateQRCode = async () => {
    if (!product || !product.gtin) {
      toast({ variant: 'destructive', title: 'Error', description: 'Product GTIN not available.' });
      return;
    }
    setIsLoading(true);
    
    const linkToEncode = generateCurrentDigitalLink(); 
    if (!linkToEncode) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not construct digital link.' });
        setIsLoading(false);
        return;
    }
    
    try {
      // Call the Firebase Function 'generateQR'
      const generateQRCallable = httpsCallable<{ productId: string; size?: string; serialNumber?: string; includeSerial?: boolean }, { qrCode: string; digitalLink: string; success: boolean }>(functions, 'generateQR');
      
      const result = await generateQRCallable({ 
        productId: product.id, 
        size: currentOptions.size,
        // Pass serial number and inclusion flag to ensure function uses the correct one
        serialNumber: includeSerialInLink ? currentOptions.serialNumber : undefined,
        includeSerial: includeSerialInLink
      });

      if (result.data.success) {
        setQrCodeDataURL(result.data.qrCode);
        setDigitalLink(result.data.digitalLink); // Update with the link from function response
        const generationTime = new Date().toISOString();
        setDisplayGeneratedAt(new Date(generationTime).toLocaleString());
        
        // The callable function 'generateQR' already calls updateProductQRCodeAction.
        // We just need to refresh the local product data.
        refreshProductData(); 
        toast({ title: 'QR Code Generated & Updated', description: 'QR code information has been updated for this product.' });
      } else {
        throw new Error('QR code generation failed on server.');
      }

    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast({ variant: 'destructive', title: 'QR Generation Failed', description: error.message || 'Could not generate the QR code.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQRCode = () => {
    if (!qrCodeDataURL || !product) return;
    const link = document.createElement('a');
    const filenameSafeName = product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const serialSuffix = includeSerialInLink && currentOptions.serialNumber ? `_sn-${currentOptions.serialNumber.replace(/[^a-z0-9]/gi, '-')}` : '_generic-gtin';
    link.download = `qr-code-${filenameSafeName}${serialSuffix}-${currentOptions.size}.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Download Started', description: `QR code ${link.download} is being downloaded.`});
  };

  if (!product) return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mr-2 inline-block"/>Loading product data...</div>;
  if (!product.gtin) return <p className="text-destructive p-4">Product GTIN is missing. Cannot generate GS1 Digital Link QR code for {product.name}. Please add a GTIN in the 'Details' tab.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <QrCodeIcon className="mr-2 h-5 w-5 text-primary" /> QR Code & GS1 Digital Link for {product.name}
        </CardTitle>
        <CardDescription>
          Generate a GS1 Digital Link compliant QR code. Preview the link that will be encoded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <Label htmlFor="qr-size">QR Code Size</Label>
            <Select
              value={currentOptions.size}
              onValueChange={(value) => setCurrentOptions({ ...currentOptions, size: value as QRCodeSize })}
              disabled={isLoading}
            >
              <SelectTrigger id="qr-size" className="mt-1">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small ({sizeMap.small}px)</SelectItem>
                <SelectItem value="medium">Medium ({sizeMap.medium}px)</SelectItem>
                <SelectItem value="large">Large ({sizeMap.large}px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="include-serial"
                    checked={includeSerialInLink}
                    onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        setIncludeSerialInLink(isChecked);
                        if (isChecked && !currentOptions.serialNumber && product.serialNumber) {
                            setCurrentOptions(prev => ({...prev, serialNumber: product.serialNumber}));
                        }
                    }}
                    disabled={isLoading}
                />
                <Label htmlFor="include-serial" className="font-medium">Include Serial Number (AI 21)</Label>
            </div>
            <Input
              id="serial-number-qr"
              placeholder={product.serialNumber || "e.g., SN12345"}
              value={currentOptions.serialNumber || ''}
              onChange={(e) => setCurrentOptions({ ...currentOptions, serialNumber: e.target.value })}
              className="mt-1"
              disabled={!includeSerialInLink || isLoading}
            />
             <p className="text-xs text-muted-foreground mt-1">
                {includeSerialInLink ? (product.serialNumber && currentOptions.serialNumber === product.serialNumber ? `Using product default: ${product.serialNumber}.` : (currentOptions.serialNumber ? `Custom: ${currentOptions.serialNumber}` : 'Enter custom serial.')) : 'Serial number will not be included.'}
            </p>
          </div>
        </div>

        <Button onClick={handleGenerateQRCode} disabled={isLoading || !product?.gtin} className="w-full md:w-auto bg-primary hover:bg-primary/90">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings2 className="mr-2 h-4 w-4" />}
          {(qrCodeDataURL || product.qrCode?.dataURL) ? 'Regenerate QR & Update Link' : 'Generate QR Code & Link'}
        </Button>

        {(digitalLink || product.qrCode?.digitalLink) && (
            <div className="p-3 border rounded-md bg-muted/50">
                <Label className="text-xs font-medium text-muted-foreground flex items-center"><LinkIcon className="mr-1 h-3 w-3"/>
                  Preview of Link to be Encoded / Current Saved Link:
                </Label>
                <a href={digitalLink || product.qrCode?.digitalLink || '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all block">
                    {digitalLink || product.qrCode?.digitalLink} <ExternalLink className="inline-block ml-1 h-3 w-3"/>
                </a>
            </div>
        )}

        {qrCodeDataURL && (
          <div className="mt-6 p-4 border rounded-lg text-center bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
                QR Code Preview ({currentOptions.size})
            </h3>
            <div className="flex justify-center mb-4 bg-white p-2 inline-block rounded-md shadow">
                <img
                    src={qrCodeDataURL}
                    alt={`QR Code for ${product.name}`}
                    style={{ width: `${sizeMap[currentOptions.size]}px`, height: `${sizeMap[currentOptions.size]}px` }}
                    data-ai-hint="QR code product"
                />
            </div>
            <div>
                <Button onClick={handleDownloadQRCode} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Download PNG
                </Button>
            </div>
            {displayGeneratedAt && (
                <p className="text-xs text-muted-foreground mt-2">Generated: {displayGeneratedAt}</p>
            )}
          </div>
        )}
         {!qrCodeDataURL && product?.qrCode?.dataURL && ( 
          <div className="mt-6 p-4 border rounded-lg text-center bg-muted/30">
             <h3 className="text-lg font-semibold mb-4 text-foreground">Previously Generated QR Code</h3>
             <div className="flex justify-center mb-4 bg-white p-2 inline-block rounded-md shadow">
                <img src={product.qrCode.dataURL} alt={`QR Code for ${product.name}`} data-ai-hint="QR code product"/>
             </div>
             {product.qrCode.digitalLink && <p className="text-xs text-muted-foreground mt-1">Linked to: {product.qrCode.digitalLink}</p>}
             {product.qrCode.generatedAt && (
                <p className="text-xs text-muted-foreground">Generated: {new Date(product.qrCode.generatedAt).toLocaleString()}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

