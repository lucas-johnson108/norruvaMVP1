// functions/src/integrations/ipfsStorage.ts
'use server';

/**
 * @fileOverview Service for interacting with IPFS (InterPlanetary File System).
 * Handles uploading files and JSON data to IPFS, retrieving data,
 * and managing CIDs (Content Identifiers).
 */

// Placeholder for IPFS client library (e.g., 'ipfs-http-client' or a gateway SDK)
// import { create, IPFSHTTPClient } from 'ipfs-http-client';

interface IpfsStorageConfig {
  gatewayUrl: string; // Public IPFS gateway or own node
  apiAddress?: string; // For nodes that support direct API interaction (e.g., http://localhost:5001)
}

export class IpfsStorageService {
  private ipfsClient: any; // Instance of IPFSHTTPClient or similar
  private gatewayUrl: string;

  constructor(config?: Partial<IpfsStorageConfig>) {
    const defaultConfig: IpfsStorageConfig = {
      gatewayUrl: process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/', // Public gateway
      apiAddress: process.env.IPFS_API_ADDRESS, // e.g., http://127.0.0.1:5001/api/v0
    };
    const effectiveConfig = { ...defaultConfig, ...config };
    this.gatewayUrl = effectiveConfig.gatewayUrl.endsWith('/') ? effectiveConfig.gatewayUrl : `${effectiveConfig.gatewayUrl}/`;

    // if (effectiveConfig.apiAddress) {
    //   try {
    //     this.ipfsClient = create({ url: effectiveConfig.apiAddress });
    //     console.log(`IPFS client connected to API: ${effectiveConfig.apiAddress}`);
    //   } catch (error) {
    //     console.error('Failed to connect IPFS client to API, falling back to gateway mode for some operations:', error);
    //     // Client might still be usable for some gateway-based operations or be null
    //   }
    // } else {
    //   console.log('IPFS client initialized in gateway-only mode (no API address provided). Uploads may not be supported directly.');
    // }

    // Mock initialization
    this.ipfsClient = {
        add: async (content: any) => {
            const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
            console.log(`Mock IPFS add, content length: ${content.toString().length}, CID: ${mockCid}`);
            return { cid: { toString: () => mockCid }, path: mockCid };
        },
        cat: async (cid: string) => {
            console.log(`Mock IPFS cat for CID: ${cid}`);
            return Buffer.from(JSON.stringify({mockDataFor: cid}));
        }
    };
     console.log(`IPFS Storage Service (mock) initialized. Gateway: ${this.gatewayUrl}`);
  }

  /**
   * Stores JSON data on IPFS.
   * @param jsonData The JSON object to store.
   * @returns Promise<string> The IPFS CID (Content Identifier) of the stored JSON.
   */
  async storeJson(jsonData: any): Promise<string> {
    if (!this.ipfsClient || typeof this.ipfsClient.add !== 'function') {
      throw new Error('IPFS client not configured for uploads. API address might be missing.');
    }
    try {
      const jsonString = JSON.stringify(jsonData);
      const result = await this.ipfsClient.add(jsonString);
      console.log(`JSON stored on IPFS. CID: ${result.cid.toString()}`);
      return result.cid.toString();
    } catch (error) {
      console.error('Error storing JSON on IPFS:', error);
      throw error;
    }
  }

  /**
   * Stores a file (Buffer) on IPFS.
   * @param fileBuffer The file content as a Buffer.
   * @param fileName (Optional) Original name of the file for metadata.
   * @returns Promise<string> The IPFS CID of the stored file.
   */
  async storeFile(fileBuffer: Buffer, fileName?: string): Promise<string> {
    if (!this.ipfsClient || typeof this.ipfsClient.add !== 'function') {
      throw new Error('IPFS client not configured for uploads. API address might be missing.');
    }
    try {
      // When adding a buffer, IPFS typically doesn't use the file name for the CID,
      // but it can be useful for directory structures if adding multiple files.
      const result = await this.ipfsClient.add(fileBuffer);
      console.log(`File ${fileName || ''} stored on IPFS. CID: ${result.cid.toString()}`);
      return result.cid.toString();
    } catch (error) {
      console.error('Error storing file on IPFS:', error);
      throw error;
    }
  }

  /**
   * Retrieves JSON data from IPFS using its CID.
   * @param cid The IPFS CID.
   * @returns Promise<any> The retrieved JSON object.
   */
  async getJson(cid: string): Promise<any> {
    console.log(`Retrieving JSON from IPFS CID: ${cid} (Placeholder)`);
    try {
        // Option 1: Use IPFS client if available and configured
        if (this.ipfsClient && typeof this.ipfsClient.cat === 'function') {
            const chunks = [];
            for await (const chunk of this.ipfsClient.cat(cid)) {
                chunks.push(chunk);
            }
            const data = Buffer.concat(chunks).toString();
            return JSON.parse(data);
        }
        // Option 2: Fallback to public gateway (less secure, rate limits)
        const response = await fetch(`${this.gatewayUrl}${cid}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch from IPFS gateway: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error retrieving JSON from IPFS CID ${cid}:`, error);
        throw error;
    }
  }

  /**
   * Retrieves a file from IPFS as a Buffer using its CID.
   * @param cid The IPFS CID.
   * @returns Promise<Buffer> The file content as a Buffer.
   */
  async getFileBuffer(cid: string): Promise<Buffer> {
     console.log(`Retrieving file buffer from IPFS CID: ${cid} (Placeholder)`);
    try {
        if (this.ipfsClient && typeof this.ipfsClient.cat === 'function') {
            const chunks = [];
            for await (const chunk of this.ipfsClient.cat(cid)) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        }
        const response = await fetch(`${this.gatewayUrl}${cid}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from IPFS gateway: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error(`Error retrieving file buffer from IPFS CID ${cid}:`, error);
        throw error;
    }
  }

  /**
   * Generates a public URL for accessing content via an IPFS gateway.
   * @param cid The IPFS CID.
   * @returns string The public URL.
   */
  getPublicUrl(cid: string): string {
    return `${this.gatewayUrl}${cid}`;
  }
}
