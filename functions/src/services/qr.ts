// functions/src/services/qr.ts
import QRCode from 'qrcode';
import { getStorage } from 'firebase-admin/storage';
import { DatabaseService } from './database'; // Assuming ProductPassport is here
import { GS1Service } from './gs1';

export interface QRCodeOptions {
  size?: number;        // Width/height of the QR code in pixels
  darkColor?: string;   // Hex color for dark modules (e.g., #000000)
  lightColor?: string;  // Hex color for light modules (e.g., #FFFFFF)
  serialNumber?: string;// Optional serial number for GS1 Digital Link
  lot?: string;         // Optional lot/batch number for GS1 Digital Link
  format?: 'png' | 'svg' | 'utf8'; // Output format
}

export interface QRCodeResult {
  digitalLink: string;
  qrImage: string | Buffer; // URL if stored, or Buffer/string if returned directly
  qrImageUrl?: string; // Specifically if stored and public URL is generated
  metadata: {
    gtin: string;
    serialNumber?: string;
    lot?: string;
    generatedAt: Date;
    sizeUsed: number;
    formatUsed: 'png' | 'svg' | 'utf8';
  };
}

export class QRCodeService {
  private storage = getStorage().bucket(); // Default bucket
  private gs1Service = new GS1Service();
  private dbService = new DatabaseService();

  /**
   * Generates a QR code for a product's GS1 Digital Link and optionally stores it.
   * @param productId The ID of the product in the database.
   * @param options QR code generation and Digital Link options.
   * @param storeInStorage If true, stores the QR code in Cloud Storage and returns a public URL.
   * @returns QRCodeResult containing the Digital Link and QR code image (URL or data).
   */
  async generateQRCode(
    productId: string,
    options: QRCodeOptions = {},
    storeInStorage: boolean = true // Default to storing in GCS
  ): Promise<QRCodeResult | null> {
    try {
      const product = await this.dbService.getProduct(productId);
      if (!product || !product.gtin) {
        console.error(`Product with ID ${productId} not found or has no GTIN.`);
        return null;
      }

      const digitalLink = this.gs1Service.generateDigitalLink(
        product.gtin,
        options.serialNumber,
        options.lot
        // baseUrl for Digital Link can be passed here or configured in GS1Service
      );

      const qrGenOptions: QRCode.QRCodeToDataURLOptions | QRCode.QRCodeToStringOptions | QRCode.QRCodeToBufferOptions = {
        errorCorrectionLevel: 'H', // High error correction
        type: options.format === 'svg' ? 'svg' : options.format === 'utf8' ? 'utf8' : 'png', // Default to png
        width: options.size || 300,
        margin: 2,
        color: {
          dark: options.darkColor || '#000000',
          light: options.lightColor || '#FFFFFF'
        }
      };
      
      let qrImageOutput: string | Buffer;
      let contentType = 'image/png';

      if (options.format === 'svg') {
        qrImageOutput = await QRCode.toString(digitalLink, { ...qrGenOptions, type: 'svg' });
        contentType = 'image/svg+xml';
      } else if (options.format === 'utf8') {
        qrImageOutput = await QRCode.toString(digitalLink, { ...qrGenOptions, type: 'utf8' });
        contentType = 'text/plain'; // Or appropriate for UTF8 string representation
      } else { // PNG
        qrImageOutput = await QRCode.toBuffer(digitalLink, { ...qrGenOptions, type: 'png' });
        contentType = 'image/png';
      }


      let qrImageUrl: string | undefined = undefined;

      if (storeInStorage && (options.format === 'png' || options.format === 'svg')) { // Only store image formats
        const fileName = `qr-codes/${productId}_${options.serialNumber || 'base'}.${options.format || 'png'}`;
        const file = this.storage.file(fileName);
        
        await file.save(qrImageOutput as Buffer, { // Cast as Buffer for png/svg for save
          metadata: {
            contentType: contentType,
            cacheControl: 'public, max-age=31536000' // Cache for 1 year
          }
        });
        
        // Generate a publicly accessible URL (signed or make public)
        // For simplicity, making it public. For signed URLs, adjust action and expires.
        await file.makePublic();
        qrImageUrl = file.publicUrl();
        // If returning the URL, qrImage could be this URL too for consistency
        // qrImageOutput = qrImageUrl; 
      }


      return {
        digitalLink,
        qrImage: qrImageOutput, // This will be buffer for PNG, string for SVG/UTF8
        qrImageUrl, // Populated if stored
        metadata: {
          gtin: product.gtin,
          serialNumber: options.serialNumber,
          lot: options.lot,
          generatedAt: new Date(),
          sizeUsed: options.size || 300,
          formatUsed: options.format || 'png'
        }
      };

    } catch (error: any) {
      console.error(`Error generating QR code for product ${productId}:`, error.message, error.stack);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }
}
