// Product Schema with Blockchain Integration
export interface DPPProduct {
  id: string;
  gtin: string; // GS1 Global Trade Item Number
  name: string;
  category: string;
  manufacturer: {
    name: string;
    did: string; // EBSI Decentralized Identifier
    verificationStatus: 'verified' | 'pending';
  };
  sustainability: {
    score: number;
    carbonFootprint: number;
    recyclable: boolean;
    materials: string[];
  };
  blockchain: {
    nftTokenId?: string;
    contractAddress?: string;
    transactionHash?: string;
  };
  compliance: {
    espr: boolean;
    ebsiCredentials: string[];
    certifications: string[];
  };
}
