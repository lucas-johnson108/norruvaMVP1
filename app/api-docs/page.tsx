
"use client"; 

import ApiEndpointDoc from "@/components/api-docs/api-endpoint-doc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, LifeBuoy, ShieldCheck, Code } from "lucide-react"; 
import Image from "next/image";
import AppHeader from "@/components/layout/app-header"; 

const sampleProductResponse = `{
  "productId": "gs1:01:12345678901234",
  "basicInfo": {
    "name": "GreenPower XL Solar Panel",
    "brand": "SunVolt",
    "model": "GP-XL-2024"
  },
  "publicData": {
    "energyLabel": "A++",
    "carbonFootprint": "80kg CO2e",
    "recyclability": "90%",
    "warranty": "10 years"
  },
  "restrictedData": {
    "repairManual": "https://example.com/repair/GP-XL-2024.pdf",
    "spareParts": [
      { "partId": "SP-CELL-05", "name": "Solar Cell Unit", "availability": "In Stock" }
    ],
    "materialComposition": { "silicon": "70%", "glass": "20%", "aluminumFrame": "5%", "other": "5%" }
  }
}`;

export default function ApiDocsPage() {
  return (
    <>
    <AppHeader /> 
    <div className="space-y-10 p-4 md:p-6 lg:p-8 bg-background min-h-screen"> 
      <header className="text-center py-12 bg-card rounded-lg shadow-strong border border-border"> 
        <Code className="h-12 w-12 text-primary mx-auto mb-4" /> 
        <h1 className="text-4xl font-space-grotesk font-bold text-primary mb-3">API Documentation</h1> 
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
          Integrate Norruva data into your applications and business systems using our robust and secure API.
        </p>
        <Button className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground text-base px-6 py-3"> 
          <Download className="mr-2 h-5 w-5" /> Download OpenAPI Spec (Placeholder)
        </Button>
      </header>

      <section>
        <h2 className="text-2xl font-space-grotesk font-semibold text-primary mb-6 border-b pb-3">Core Endpoints</h2> 
        <ApiEndpointDoc
          method="GET"
          path="/api/v1/products/{productId}/passport"
          description="Retrieves the Digital Product Passport data for a specific product. Access level depends on authentication and role."
          parameters={[
            { name: "productId", type: "string", description: "The unique identifier of the product (e.g., GS1 GTIN).", required: true },
          ]}
          responseExample={sampleProductResponse}
        />
         <ApiEndpointDoc
          method="POST"
          path="/api/v1/products"
          description="Creates a new product entry. Requires manufacturer-level authentication."
          parameters={[
            { name: "productData", type: "object", description: "JSON object containing product details.", required: true },
          ]}
          responseExample={`{ "status": "success", "productId": "gs1:01:NEWPRODUCTID", "message": "Product created successfully." }`}
        />
      </section>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <Card className="shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="font-space-grotesk flex items-center gap-2 text-lg"><ShieldCheck className="text-accent h-6 w-6" />Authentication & Authorization</CardTitle> 
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3 font-inter">
              API access is secured using API keys and role-based permissions. Ensure your API key is included in the 
              <code className="font-mono bg-muted px-1.5 py-0.5 rounded mx-1 text-foreground">Authorization: Bearer YOUR_API_KEY</code> header.
            </p>
            <p className="text-muted-foreground font-inter">
              Data visibility is tiered: Public, Restricted (partners), Private (manufacturers), Full (regulators). The API automatically filters responses based on your role.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="font-space-grotesk flex items-center gap-2 text-lg"><LifeBuoy className="text-primary h-6 w-6"/>Support & Rate Limiting</CardTitle> 
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3 font-inter">
              Rate limits apply to prevent abuse and ensure fair usage. Standard limits are 100 requests/minute. Contact support for higher tiers.
            </p>
            <p className="text-muted-foreground font-inter">
              For technical support or questions regarding API integration, please visit our <Button variant="link" asChild className="p-0 h-auto text-primary"><a href="/support">Support Portal (Placeholder)</a></Button>.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-12"> 
          <Image src="https://placehold.co/1200x300.png" alt="API Documentation placeholder banner" width={1200} height={300} className="rounded-lg border" data-ai-hint="api documentation"/>
      </div>
    </div>
    </>
  );
}
