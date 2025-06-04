
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function QrGeneratorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold text-primary flex items-center">
          <QrCode className="mr-3 h-8 w-8" /> QR Code Generator
        </h1>
      </div>
      <CardDescription>
        Tools for generating and managing QR codes for your products.
      </CardDescription>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">QR Code Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            QR Code generation functionality is typically available within each product's detail page.
            You can generate QR codes that link to the public Digital Product Passport.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/products">Go to Product Management</Link>
          </Button>
          {/* Future: Maybe bulk QR generation tools or templates could live here. */}
        </CardContent>
      </Card>
    </div>
  );
}
