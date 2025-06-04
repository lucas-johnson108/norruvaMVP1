
import express, { type Request, type Response } from 'express';
import * as admin from 'firebase-admin'; // Added admin import

const router = express.Router();

// Example public GET endpoint
router.get('/info', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'This is a public information endpoint for Norruva.',
    version: 'v1',
    timestamp: new Date().toISOString()
  });
});

// Example public POST endpoint (e.g., for a public contact form)
router.post('/submit-query', (req: Request, res: Response) => {
  const { name, email, query } = req.body;
  if (!name || !email || !query) {
    return res.status(400).json({ error: 'Missing required fields: name, email, query.' });
  }
  // In a real app, you would process this data (e.g., send an email, save to DB)
  console.log('Public query received:', { name, email, query });
  res.status(201).json({
    message: 'Query submitted successfully. We will get back to you shortly.',
    dataReceived: { name, email }
  });
});

// For frontend pages expecting this structure:
interface PublicProductData {
  productId: string;
  basicInfo: { name: string; brand: string; model: string; category?: string; image?: string; description?: string; };
  sustainability?: { 
    carbonFootprint?: string; 
    energyRating?: string;  // Using energyRating consistently
    recyclability?: string; 
    highlights?: string[]; 
    waterUsage?: string;
    renewableEnergySource?: string;
    sustainabilityScore?: {
        score: number;
        rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
        assessmentDetails?: string;
    };
  };
  materials?: { 
    composition?: Array<{ name: string, percentage?: string, source?: string, isRecycled?: boolean }>; 
    hazardousSubstances?: Array<{ name: string, concentration?: string, notes?: string }>; 
  };
  compliance?: { 
    certifications?: Array<{ name: string, issuer: string, link?: string, expiryDate?: string, standard?: string }>; 
    verificationStatus?: 'Verified' | 'Pending' | 'Failed' | 'Self-Asserted' | 'Not Assessed'; 
    verifiedDate?: string;
    regulatoryCompliance?: Array<{ regulation: string; status: 'Compliant' | 'Non-Compliant' | 'N/A'; details?: string }>;
  };
  lifecycle?: { 
    manufacturingDate?: string; 
    warrantyInfo?: string; 
    repairInstructions?: string; 
    recyclingInfo?: string; 
    expectedLifespan?: string;
    disassemblyGuideUrl?: string;
  };
  trustIndicators?: { 
    verificationBadge?: string; 
    dataSource?: string; 
    lastUpdated?: string; 
    blockchainTransactionId?: string;
  };
  realTimeVerification?: {
    status: 'Verified' | 'Pending' | 'Failed';
    timestamp: string;
    verifier?: string;
  };
}

// Mock data for the public API endpoint (aligns with frontend expectations)
const MOCK_PUBLIC_PRODUCTS_API: { [key: string]: PublicProductData } = {
  "prod_mfg_001": { 
    productId: "prod_mfg_001 / GTIN:01234567890123",
    basicInfo: {
      name: "EcoSmart Refrigerator X1000 (API)",
      brand: "GreenTech",
      model: "X1000",
      category: "Home Appliances",
      image: "https://placehold.co/600x400.png?text=Fridge+X1000+API",
      description: "A premium, energy-efficient smart refrigerator from the API."
    },
    sustainability: { 
        carbonFootprint: "350kg CO2e", 
        energyRating: "A+++", 
        recyclability: "75%", 
        highlights: ["Made with 30% recycled steel (API)"],
        sustainabilityScore: { 
            score: 8.7,
            rating: 'Excellent',
            assessmentDetails: 'API: Based on high recyclability, use of recycled content, and A+++ energy rating.'
          }
    },
    materials: {
        composition: [ { name: "Recycled Steel", percentage: "30%", isRecycled: true } ],
        hazardousSubstances: [ { name: "Lead (Pb) in solder", concentration: "< 0.01%", notes: "RoHS Compliant via API" } ]
    },
    compliance: { 
        verificationStatus: "Verified", 
        verifiedDate: "2024-03-10",
        certifications: [{ name: "CE Mark (API)", issuer: "API Cert Body", standard: "EN 60335-1"}]
    },
    lifecycle: {
        manufacturingDate: "2024-01-15",
        warrantyInfo: "5 years (compressor), 2 years (parts) - API",
        recyclingInfo: "API: Contact authorized recyclers.",
        disassemblyGuideUrl: "https://api.example.com/disassembly/x1000"
    },
    trustIndicators: { 
        lastUpdated: new Date().toISOString(),
        dataSource: "Manufacturer Portal (API)",
        blockchainTransactionId: "0xAPI_MOCK_TX_HASH_001"
    },
  },
   "example-dpp-id-001": { 
    productId: "GTIN:01234567890123 (API)",
    basicInfo: { name: "EcoStar Refrigerator Model Z (API)", brand: "FutureHome Appliances", model: "ES-REF-Z-2024", image: "https://placehold.co/600x400.png?text=EcoStar+API" },
    sustainability: { energyRating: "A++", carbonFootprint: "120 kg CO2eq" }, // Changed energyLabel to energyRating
    compliance: { certifications: [{name: "Energy Star", issuer: "EPA"}]},
    trustIndicators: { lastUpdated: new Date().toISOString() },
  }
};


// Updated Public Product API (for QR codes)
router.get('/products/:productId', async (req: Request, res: Response) => {
  const { productId } = req.params;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }
  try {
    // Attempt to fetch from mock first for consistent testing for known IDs
    const mockProduct = MOCK_PUBLIC_PRODUCTS_API[productId];
    if (mockProduct) {
      return res.status(200).json(mockProduct);
    }

    // Fallback to Firestore if not in mock (real scenario)
    const doc = await admin.firestore()
      .collection('publicProducts').doc(productId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found in mock or Firestore.' });
    }
    const publicData = doc.data() as PublicProductData; // Assume Firestore data matches this structure
    res.status(200).json(publicData);

  } catch (error: any) {
    console.error(`Error fetching public product ${productId}:`, error);
    res.status(500).json({ error: 'Internal server error while fetching product data.' });
  }
});

export const publicRouter = router;
