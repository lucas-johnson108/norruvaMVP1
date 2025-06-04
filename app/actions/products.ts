
"use server";

import { 
  type MultiStepProductFormValues, 
  multiStepProductFormSchema,
  type MockProduct, 
  type QRCodeData,
  type ProductDetailsUpdateValues,
  productDetailsUpdateSchema,
  type ProductSustainabilityUpdateValues, 
  productSustainabilityUpdateSchema,
  type ProductSupplyChainUpdateValues,
  productSupplyChainUpdateSchema,
  type ProductDocument
} from '@/types/product-form-types'; 
import crypto from 'crypto'; // For generating unique IDs

interface ServerActionResult<T = null> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field?: string; message: string }[];
}

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const recentDateISO = yesterday.toISOString();

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const olderDateISO = thirtyDaysAgo.toISOString();


const mockProductDatabase: MockProduct[] = [
  {
    id: "prod_mfg_001",
    gtin: "01234567890123",
    serialNumber: "SN001XYZ",
    name: "EcoSmart Refrigerator X1000",
    brand: "GreenTech",
    model: "X1000",
    category: 'appliances',
    manufacturingDate: "2023-10-01T00:00:00.000Z",
    countryOfOrigin: "DE",
    description: "A top-tier eco-friendly refrigerator with advanced cooling and smart energy management. Features include an inverter compressor, multi-zone temperature control, and IoT connectivity for remote monitoring. Made with 60% recycled steel and designed for easy disassembly and repair.",
    dppStatus: 'Complete',
    dppCompletion: 100,
    complianceStatus: 'Compliant',
    declarationOfConformityDocName: "DoC_EcoSmart_X1000.pdf",
    testReportDocNames: ["SafetyReport_X1000.pdf", "EMC_Test_X1000.pdf"],
    carbonFootprint: 350,
    recyclabilityScore: 75,
    materialSummary: "Recycled Steel (Frame & Body): 30%, ABS Plastic (Interior Liners): 25%, Tempered Glass (Shelves): 15%",
    energyConsumption: "150 kWh/year",
    waterUsage: "N/A",
    renewableMaterialContent: 30, 
    repairabilityIndex: 8.5, 
    manufacturingSiteName: "GreenTech Factory One",
    manufacturingSiteLocation: "Berlin, Germany",
    supplierInformation: "Compressor: CoolParts GmbH; Electronics: ChipMax Inc.",
    componentOriginsInfo: "Compressor: Germany; Display Panel: South Korea",
    lastAuditDate: '2024-03-15T00:00:00.000Z',
    lastUpdated: recentDateISO, 
    imageUrl: 'https://placehold.co/600x400.png',
    companyId: 'gt-001', // Matched to Manufacturer User's companyId
    regulations: [{name: 'EU ESPR', status: 'Compliant'}, {name: 'Energy Labeling', status: 'Compliant'}],
    verificationLog: [
        {event: 'DPP Created (Draft)', date: '2024-03-01T00:00:00.000Z', verifier: 'System'},
        {event: 'Submitted for Verification', date: '2024-03-05T00:00:00.000Z', verifier: 'Alice Manufacturer'},
        {event: 'Verification Approved', date: '2024-03-10T00:00:00.000Z', verifier: 'EcoCert Inc.', notes: 'All documents in order.'},
        {event: 'DPP Marked Complete', date: '2024-03-15T00:00:00.000Z', verifier: 'System'}
    ],
    qrCode: { 
        dataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", 
        digitalLink: "https://dpp.norruva-demo.com/01/01234567890123/21/SN001XYZ",
        generatedAt: new Date(Date.now() - 86400000 * 2).toISOString() 
    },
    blockchain: { 
        nftTokenId: "101",
        contractAddress: "0xMockDPPNFTContractAddress001...Cafe",
        transactionHash: "0xmocktx_fridge_mint_123"
    },
    documents: [
      { id: 'DOC001-X1000', name: 'CE Declaration - X1000.pdf', type: 'Declaration', uploadDate: '2024-01-15T10:00:00Z', fileUrl: '#', version: '1.2', size: '1.1MB', fileName: 'CE Declaration - X1000.pdf'},
      { id: 'DOC002-X1000', name: 'User Manual (EN) - X1000.pdf', type: 'Manual', uploadDate: '2024-01-10T11:00:00Z', fileUrl: '#', version: '2.0.1', size: '5.2MB', fileName: 'User Manual (EN) - X1000.pdf'},
      { id: 'DOC003-X1000', name: 'Energy Label - X1000.png', type: 'Image', uploadDate: '2024-01-05T09:30:00Z', fileUrl: '#', size: '350KB', fileName: 'Energy Label - X1000.png'},
    ]
  },
  {
    id: "prod_mfg_002",
    gtin: "01234567890124",
    serialNumber: "SN002ABC",
    name: "Sustainable Cotton T-Shirt",
    brand: "EcoThreads",
    model: "Organic Tee",
    category: 'textile',
    manufacturingDate: "2024-02-15T00:00:00.000Z",
    countryOfOrigin: "PT",
    description: "100% organic cotton t-shirt.",
    dppStatus: 'Pending Verification',
    dppCompletion: 60,
    complianceStatus: 'Pending Review',
    carbonFootprint: 5,
    recyclabilityScore: 95,
    energyConsumption: "N/A",
    waterUsage: "20L/shirt (lifecycle)",
    renewableMaterialContent: 100,
    repairabilityIndex: 4.0,
    lastAuditDate: undefined,
    lastUpdated: olderDateISO,
    imageUrl: 'https://placehold.co/600x400.png',
    companyId: 'gt-001', // Matched to Manufacturer User's companyId
    regulations: [{name: 'EU Textile Strategy', status: 'Pending Review'}],
    verificationLog: [
        {event: 'DPP Initiated', date: '2024-05-20T00:00:00.000Z', verifier: 'Manufacturer'},
        {event: 'Submitted for Verification', date: '2024-05-21T00:00:00.000Z', verifier: 'Bob Supplier (Contributor)'}
    ],
    qrCode: {
        dataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        digitalLink: "https://dpp.norruva-demo.com/01/01234567890124/21/SN002ABC",
        generatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    blockchain: undefined,
    documents: [
      { id: 'DOC001-TSHIRT', name: 'GOTS Certificate - EcoThreads.pdf', type: 'Certificate', uploadDate: '2024-02-01T14:00:00Z', fileUrl: '#', version: '3.1', size: '750KB', fileName: 'GOTS Certificate - EcoThreads.pdf'},
    ]
  },
   {
    id: "prod_mfg_003",
    gtin: "01234567890125",
    serialNumber: "SN003DEF",
    name: "Recycled Plastic Phone Case",
    brand: "ReCase",
    model: "EcoShell",
    category: 'electronics',
    manufacturingDate: "2024-04-10T00:00:00.000Z",
    countryOfOrigin: "TW",
    description: "Durable phone case made from 90% recycled ocean plastics.",
    dppStatus: 'Changes Requested',
    dppCompletion: 40,
    complianceStatus: 'Partially Compliant',
    carbonFootprint: 2,
    recyclabilityScore: 90,
    energyConsumption: "0.1 kWh (manufacturing)",
    waterUsage: "0.5L (manufacturing)",
    renewableMaterialContent: 90,
    repairabilityIndex: 2.5,
    lastAuditDate: undefined,
    lastUpdated: recentDateISO,
    imageUrl: 'https://placehold.co/600x400.png',
    companyId: 'gt-001', // Matched to Manufacturer User's companyId
    regulations: [{name: 'Recycled Content Standard', status: 'Pending Re-evaluation'}],
    verificationLog: [
        {event: 'DPP Draft Created', date: '2024-06-01T00:00:00.000Z', verifier: 'Manufacturer'},
        {event: 'Submitted for Verification', date: '2024-06-02T00:00:00.000Z', verifier: 'Manufacturer'},
        {event: 'Changes Requested by Verifier', date: '2024-06-05T00:00:00.000Z', verifier: 'CertifyGlobal', notes: 'Recycled content source documentation unclear. Please provide batch certificates.'}
    ],
    qrCode: undefined,
    blockchain: undefined,
    documents: []
  },
];

export async function createProductAction(
  formData: MultiStepProductFormValues 
): Promise<ServerActionResult<{ product: MockProduct }>> {
  const validationResult = multiStepProductFormSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed. Please check the product details.",
      errors: validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  const newProductId = `prod_mfg_${Date.now()}`;
  const nowISO = new Date().toISOString();
  const data = validationResult.data;

  const newProduct: MockProduct = {
    id: newProductId,
    gtin: data.gtin,
    name: data.name,
    brand: data.brand,
    model: data.model,
    serialNumber: `SN-MOCK-${Date.now().toString().slice(-4)}`,
    category: data.category,
    manufacturingDate: data.manufacturingDate.toISOString(),
    countryOfOrigin: data.countryOfOrigin,
    description: data.description || '',
    imageUrl: data.imageUrl || `https://placehold.co/64x64.png?text=${data.name.substring(0,3)}`,
    
    dppStatus: 'Draft', 
    dppCompletion: 20, 
    
    complianceStatus: data.complianceStatus || 'Pending Review',
    declarationOfConformityDocName: data.declarationOfConformity instanceof File 
                                     ? data.declarationOfConformity.name 
                                     : (typeof data.declarationOfConformity === 'string' ? data.declarationOfConformity : undefined),
    testReportDocNames: data.testReports instanceof FileList 
                        ? Array.from(data.testReports).map(f => f.name)
                        : (Array.isArray(data.testReports) && data.testReports.every(item => typeof item === 'string') ? data.testReports : undefined),
    
    carbonFootprint: data.carbonFootprint,
    recyclabilityScore: data.recyclabilityScore,
    materialSummary: data.materialSummary || '',
    
    energyConsumption: undefined, 
    waterUsage: undefined,
    renewableMaterialContent: undefined,
    repairabilityIndex: undefined,
    
    manufacturingSiteName: data.manufacturingSiteName || '',
    manufacturingSiteLocation: data.manufacturingSiteLocation || '',
    supplierInformation: data.supplierInformation || '',
    componentOriginsInfo: data.componentOriginsInfo || '',
    
    lastUpdated: nowISO,
    companyId: 'gt-001', // Default to the manufacturer's company ID
    verificationLog: [{event: 'DPP Created (Draft)', date: nowISO, verifier: 'System (Initial Create)'}],
    qrCode: undefined, 
    blockchain: undefined,
    documents: [], 
    regulations: [],
    certificates: [],
    suppliers: [],
    componentOrigins: [],
    manufacturingSite: undefined,
    lastAuditDate: undefined,
  };

  mockProductDatabase.push(newProduct);
  return {
    success: true,
    data: { product: JSON.parse(JSON.stringify(newProduct)) },
    message: `Product "${data.name}" has been successfully registered with ID ${newProductId}. Further details can be added.`,
  };
}

export async function listProductsAction(companyId: string): Promise<ServerActionResult<MockProduct[]>> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const productsToList = mockProductDatabase.filter(p => p.companyId === companyId || companyId === 'admin-view-all-for-mock');
  productsToList.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  return {
    success: true,
    data: JSON.parse(JSON.stringify(productsToList)),
  };
}

export async function submitForVerificationAction(productId: string, userId: string): Promise<ServerActionResult> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const productIndex = mockProductDatabase.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return { success: false, message: "Product not found." };
  }
  mockProductDatabase[productIndex].dppStatus = 'Pending Verification';
  mockProductDatabase[productIndex].verificationLog = [
    ...(mockProductDatabase[productIndex].verificationLog || []),
    { event: 'Submitted for Verification', date: new Date().toISOString(), verifier: userId, notes: 'User submitted for verification.' }
  ];
  mockProductDatabase[productIndex].lastUpdated = new Date().toISOString();
  return { success: true, message: "Product submitted for verification." };
}

export async function processVerificationAction(
  productId: string,
  action: 'approve' | 'reject' | 'request_changes',
  notes: string,
  verifierId: string
): Promise<ServerActionResult> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const productIndex = mockProductDatabase.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return { success: false, message: "Product not found." };
  }

  let newStatus: MockProduct['dppStatus'] = mockProductDatabase[productIndex].dppStatus;
  let eventMessage = '';

  switch (action) {
    case 'approve':
      newStatus = 'Complete';
      eventMessage = 'Verification Approved';
      mockProductDatabase[productIndex].dppCompletion = 100;
      mockProductDatabase[productIndex].complianceStatus = 'Compliant'; 
      break;
    case 'reject':
      newStatus = 'Incomplete'; 
      eventMessage = 'Verification Rejected';
      mockProductDatabase[productIndex].complianceStatus = 'Non-Compliant'; 
      break;
    case 'request_changes':
      newStatus = 'Changes Requested';
      eventMessage = 'Changes Requested by Verifier';
      break;
  }

  mockProductDatabase[productIndex].dppStatus = newStatus;
  mockProductDatabase[productIndex].verificationLog = [
    ...(mockProductDatabase[productIndex].verificationLog || []),
    { event: eventMessage, date: new Date().toISOString(), verifier: verifierId, notes }
  ];
  mockProductDatabase[productIndex].lastUpdated = new Date().toISOString();
  return { success: true, message: `Verification processed: ${eventMessage}` };
}

export async function updateProductQRCodeAction(productId: string, qrCodeData: QRCodeData): Promise<ServerActionResult> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const productIndex = mockProductDatabase.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return { success: false, message: "Product not found to update QR code." };
  }
  mockProductDatabase[productIndex].qrCode = qrCodeData;
  mockProductDatabase[productIndex].lastUpdated = new Date().toISOString();
  
  if (!mockProductDatabase[productIndex].blockchain?.nftTokenId && qrCodeData.dataURL) {
      mockProductDatabase[productIndex].blockchain = {
          nftTokenId: `mockNFT-${productId.slice(-4)}`,
          contractAddress: `0xMockContract...${productId.slice(-3)}`,
          transactionHash: `0xmockTx...${Date.now().toString().slice(-5)}`,
      };
  }
  
  console.log(`Updated QR code and potentially blockchain info for ${productId}:`, qrCodeData, mockProductDatabase[productIndex].blockchain);
  return { success: true, message: "QR code information updated for product." };
}

export async function updateProductDetailsAction(
  productId: string,
  data: ProductDetailsUpdateValues
): Promise<ServerActionResult<{ product: MockProduct }>> {
  const validationResult = productDetailsUpdateSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed for product details update.",
      errors: validationResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
    };
  }

  await new Promise(resolve => setTimeout(resolve, 500)); 

  const productIndex = mockProductDatabase.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return { success: false, message: "Product not found for update." };
  }

  const updatedProduct = { ...mockProductDatabase[productIndex] };
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const typedKey = key as keyof ProductDetailsUpdateValues;
      const value = data[typedKey];
      if (value !== undefined) { 
        (updatedProduct as any)[typedKey] = value === null ? null : value;
      }
    }
  }
  updatedProduct.lastUpdated = new Date().toISOString();
  
  if (data.manufacturingDate) {
      // The form passes Date object, action expects ISO string
      // This action expects an ISO string already based on ProductDetailsUpdateValues
      // So, no conversion needed here if form submits ISO string directly.
      // If form submits Date object, it needs to be converted BEFORE calling this action.
      // For now, assume data.manufacturingDate is string OR was converted by caller
      updatedProduct.manufacturingDate = data.manufacturingDate;
  }

  mockProductDatabase[productIndex] = updatedProduct;

  return {
    success: true,
    data: { product: JSON.parse(JSON.stringify(updatedProduct)) },
    message: `Product "${updatedProduct.name}" details updated successfully.`,
  };
}

export async function updateProductSustainabilityAction(
  productId: string,
  data: ProductSustainabilityUpdateValues
): Promise<ServerActionResult<{ product: MockProduct }>> {
  const validationResult = productSustainabilityUpdateSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed for sustainability data update.",
      errors: validationResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
    };
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));

  const productIndex = mockProductDatabase.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return { success: false, message: "Product not found for sustainability update." };
  }

  const updatedProduct = { ...mockProductDatabase[productIndex] };

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const typedKey = key as keyof ProductSustainabilityUpdateValues;
      const value = data[typedKey];
      if (value !== undefined) { // Check for undefined, allow null to be set
        (updatedProduct as any)[typedKey] = value;
      }
    }
  }
  updatedProduct.lastUpdated = new Date().toISOString();
  mockProductDatabase[productIndex] = updatedProduct;

  return {
    success: true,
    data: { product: JSON.parse(JSON.stringify(updatedProduct)) },
    message: `Sustainability details for "${updatedProduct.name}" updated successfully.`,
  };
}

export async function updateProductSupplyChainAction(
  productId: string,
  data: ProductSupplyChainUpdateValues
): Promise<ServerActionResult<{ product: MockProduct }>> {
  const validationResult = productSupplyChainUpdateSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed for supply chain data update.",
      errors: validationResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
    };
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));

  const productIndex = mockProductDatabase.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return { success: false, message: "Product not found for supply chain update." };
  }

  const updatedProduct = { ...mockProductDatabase[productIndex] };

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const typedKey = key as keyof ProductSupplyChainUpdateValues;
      const value = data[typedKey];
      if (value !== undefined) {
        (updatedProduct as any)[typedKey] = value;
      }
    }
  }
  updatedProduct.lastUpdated = new Date().toISOString();
  mockProductDatabase[productIndex] = updatedProduct;

  return {
    success: true,
    data: { product: JSON.parse(JSON.stringify(updatedProduct)) },
    message: `Supply chain details for "${updatedProduct.name}" updated successfully.`,
  };
}

// Document Actions
export async function addProductDocumentAction(
  productId: string,
  documentData: { name: string; type: string; version?: string; fileName?: string; fileSize?: number }
): Promise<ServerActionResult<{ document: ProductDocument }>> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const productIndex = mockProductDatabase.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return { success: false, message: "Product not found." };
  }

  const product = mockProductDatabase[productIndex];
  const newDocumentId = `doc_${crypto.randomBytes(6).toString('hex')}`;
  const newDocument: ProductDocument = {
    id: newDocumentId,
    name: documentData.name,
    type: documentData.type,
    uploadDate: new Date().toISOString(),
    fileUrl: `/uploads/mock/${documentData.fileName || documentData.name.replace(/\s/g, '_')}`, // Mock URL
    version: documentData.version,
    size: documentData.fileSize ? `${(documentData.fileSize / (1024 * 1024)).toFixed(2)} MB` : undefined,
    fileName: documentData.fileName,
  };

  if (!product.documents) {
    product.documents = [];
  }
  product.documents.push(newDocument);
  product.lastUpdated = new Date().toISOString();

  mockProductDatabase[productIndex] = product;

  return {
    success: true,
    data: { document: newDocument },
    message: `Document "${newDocument.name}" added to product "${product.name}".`,
  };
}

export async function deleteProductDocumentAction(
  productId: string,
  documentId: string
): Promise<ServerActionResult> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const productIndex = mockProductDatabase.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return { success: false, message: "Product not found." };
  }

  const product = mockProductDatabase[productIndex];
  const initialDocCount = product.documents?.length || 0;
  if (product.documents) {
    product.documents = product.documents.filter(doc => doc.id !== documentId);
  }

  if ((product.documents?.length || 0) < initialDocCount) {
    product.lastUpdated = new Date().toISOString();
    mockProductDatabase[productIndex] = product;
    return { success: true, message: "Document deleted successfully." };
  } else {
    return { success: false, message: "Document not found or already deleted." };
  }
}

