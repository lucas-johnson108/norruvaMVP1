
"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats, type Html5QrcodeResult, type QrcodeErrorCallback, type QrcodeSuccessCallback } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, VideoOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRScanHandlerProps {
  onScanSuccess: (productId: string) => void;
  onClose: () => void;
}

const QR_READER_ELEMENT_ID = "qr-reader-ecopass-app"; // ID used in ecopass-app/main.tsx modal

function trackScanEvent(productId: string, qrCodeContent: string) {
  console.log("Tracking QR Scan Event (EcopassApp):", {
    productId,
    qrCodeContent,
    scan_timestamp: new Date().toISOString(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
  });
}

const QRScanHandler: React.FC<QRScanHandlerProps> = ({ onScanSuccess, onClose }) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false); // To control UI elements if needed
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement | null>(null); // For ensuring div is there

  const extractProductId = useCallback((url: string): string | null => {
    console.log("Original scanned URL/text:", url);
    try {
      // Attempt to parse as URL first to handle full URLs
      const parsedUrl = new URL(url);
      const pathSegments = parsedUrl.pathname.split('/');

      // Check for /product/[id] structure
      const productIndex = pathSegments.indexOf('product');
      if (productIndex !== -1 && pathSegments.length > productIndex + 1) {
        const potentialId = pathSegments[productIndex + 1];
        if (potentialId) {
            console.log("Extracted ID via /product/ path:", potentialId);
            return decodeURIComponent(potentialId);
        }
      }

      // Check for GS1 Digital Link path /01/GTIN
      const gs1GtinPathIndex = pathSegments.indexOf('01');
      if (gs1GtinPathIndex !== -1 && pathSegments.length > gs1GtinPathIndex + 1) {
        const potentialGtin = pathSegments[gs1GtinPathIndex + 1];
        // GS1 GTINs are numeric and typically 8, 12, 13, or 14 digits long.
        if (/^\d{8,14}$/.test(potentialGtin)) { // Corrected regex, no need for double backslash
             console.log("Extracted GTIN via /01/ path (GS1 Digital Link style):", potentialGtin);
            return potentialGtin;
        }
      }
      
      // Check for common query parameters like productId, product, or id
      const queryParams = ['productId', 'product', 'id'];
      for (const param of queryParams) {
        const productIdFromQuery = parsedUrl.searchParams.get(param);
        if (productIdFromQuery) {
          console.log(`Extracted ID via query parameter '${param}':`, productIdFromQuery);
          return productIdFromQuery;
        }
      }

    } catch (e) {
      // Not a full URL, try parsing as a direct ID or partial path if it's not a standard URL structure.
      console.log("Scanned text is not a full URL, trying regex patterns on raw text:", url);
    }

    // Handle partial paths or direct IDs if not a full URL
    // Order matters: more specific patterns first.
    const patterns: { name: string, regex: RegExp, type: 'group' | 'full' }[] = [
      { name: "Partial /product/ path", regex: /\/product\/([^/?#]+)/, type: 'group' }, // e.g., /product/someId
      { name: "Partial /01/ GTIN path", regex: /\/01\/(\d{8,14})/, type: 'group' },    // e.g., /01/1234567890123
      { name: "Direct prod_mfg_ ID", regex: /^prod_mfg_[\w-]+$/, type: 'full' },      // e.g., prod_mfg_abc123
      { name: "Plain GTIN", regex: /^\d{8,14}$/, type: 'full' }          // e.g., 1234567890123
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern.regex);
      if (match) {
        if (pattern.type === 'group' && match[1]) {
          console.log(`Extracted ID via regex pattern '${pattern.name}':`, match[1]);
          return decodeURIComponent(match[1]);
        }
        if (pattern.type === 'full') { // Full match means the URL itself is the ID
          console.log(`Extracted ID via regex pattern (full match) '${pattern.name}':`, url);
          return url;
        }
      }
    }
    console.log("No product ID extracted from:", url);
    return null; // No ID found
  }, []);


  useEffect(() => {
    // Ensure the container div exists before initializing the scanner
    if (!scannerContainerRef.current) {
        console.warn("Scanner container div not found on mount.");
        return;
    }
    
    // Prevent re-initialization if scanner already exists or is active
    if (scannerRef.current || isScannerActive) {
        return;
    }
    
    setError(null);
    setIsScannerActive(true); // Set active before rendering

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      QR_READER_ELEMENT_ID, // This ID must match the div in the JSX
      config,
      false // verbose
    );
    scannerRef.current = html5QrcodeScanner;

    const successCallback: QrcodeSuccessCallback = (decodedText, decodedResult) => {
      if (scannerRef.current) {
        // Stop scanning and clear
        scannerRef.current.clear().then(() => {
          scannerRef.current = null; // Prevent multiple clears
          setIsScannerActive(false); // Update UI state
          try {
            const productId = extractProductId(decodedText);
            if (productId) {
              trackScanEvent(productId, decodedText); 
              onScanSuccess(productId);
            } else {
              const errMsg = `Invalid product QR code. Scanned: "${decodedText.substring(0,100)}${decodedText.length > 100 ? '...' : ''}". Could not extract a valid product identifier.`;
              setError(errMsg);
              toast({ variant: 'destructive', title: "Invalid QR Code", description: "The scanned QR code does not appear to be a valid Norruva product link." });
            }
          } catch (err) {
            console.error("Error processing QR code:", err);
            setError('Error processing QR code. Please try again.');
          }
        }).catch(err => {
          console.error("Error clearing scanner:", err);
          setError('Scanner cleanup error.');
          setIsScannerActive(false);
        });
      }
    };

    const errorCallback: QrcodeErrorCallback = (errorMessage) => {
      // Handle common errors or provide feedback
      if (errorMessage.toLowerCase().includes("permission denied") || errorMessage.toLowerCase().includes("notallowederror")) {
        setError("Camera permission denied. Please enable camera access in your browser settings.");
        if (scannerRef.current) {
           scannerRef.current.clear().catch(e => console.warn("Error clearing scanner on permission denial:", e));
           scannerRef.current = null;
        }
        setIsScannerActive(false); // Ensure UI updates
      } else if (!errorMessage.toLowerCase().includes("qrcode scan region")) { // Ignore 'no QR code in region' errors for continuous scanning
         console.debug(`QR Code scan failure (may be ignored): ${errorMessage}`);
      }
    };
    
    // Check if the target div exists before rendering
    const qrElement = document.getElementById(QR_READER_ELEMENT_ID);
    if (qrElement) { // && qrElement.childElementCount === 0 to prevent re-render if already active
        try {
            html5QrcodeScanner.render(successCallback, errorCallback);
        } catch (renderError) {
            console.error("Error rendering scanner:", renderError);
            setError("Failed to initialize QR scanner. Please check camera permissions and try refreshing.");
            setIsScannerActive(false);
        }
    } else {
        console.error(`Element with ID '${QR_READER_ELEMENT_ID}' not found for QR scanner.`);
        setError(`Scanner UI element could not be found. Please ensure the div with ID '${QR_READER_ELEMENT_ID}' exists.`);
    }


    return () => {
      if (scannerRef.current) {
        try {
          // Check if scanner is in a state that can be cleared
          // The library itself might throw if clear() is called when not appropriate.
          // We attempt to clear only if a scanner instance exists.
          if (document.getElementById(QR_READER_ELEMENT_ID)) { 
            scannerRef.current.clear()
              .catch(err => console.warn("Minor error clearing scanner on cleanup:", err))
              .finally(() => { scannerRef.current = null; });
          }
        } catch (e) {
            console.warn("Could not clear html5-qrcode scanner on cleanup: ", e);
        }
      }
       setIsScannerActive(false); // Ensure active state is reset
    };
  }, [onScanSuccess, extractProductId, toast, isScannerActive]); // Added isScannerActive to deps to help manage re-initialization

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div id={QR_READER_ELEMENT_ID} ref={scannerContainerRef} className="w-full max-w-xs aspect-square rounded-lg overflow-hidden border-2 border-primary bg-muted">
        {/* Scanner UI renders here */}
         {!isScannerActive && !error && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <Loader2 className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-center">Initializing scanner... Please wait.</p>
            <p className="text-xs text-center mt-1">If camera prompt appears, please allow access.</p>
          </div>
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="w-full max-w-xs">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Scan Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button variant="outline" onClick={onClose} className="w-full max-w-xs">
        <VideoOff className="mr-2 h-4 w-4" /> Stop Scanning & Close
      </Button>
    </div>
  );
};

export default QRScanHandler;
