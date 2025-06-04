
"use client";
import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertTriangle, Package, Leaf, Recycle, Factory, ShieldCheck, Info, ExternalLink, CalendarDays, Wrench, ThumbsUp, Database, Search, Clock, Download, Award, Star } from 'lucide-react'; // Added Award, Star
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AppHeader from '@/components/layout/app-header';
import { cn } from '@/lib/utils';

interface ProductData {
  productId: string;
  basicInfo: {
    name: string;
    brand: string;
    model: string;
    category?: string;
    image?: string;
    description?: string;
  };
  sustainability?: {
    carbonFootprint?: string;
    energyRating?: string;
    recyclability?: string;
    highlights?: string[];
    waterUsage?: string;
    renewableEnergySource?: string;
    sustainabilityScore?: { // New field
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

async function getPublicProductFromAPI(productId: string): Promise<ProductData | null> {
  try {
    console.log(`Fetching product from API: /api/v1/public/products/${productId}`);

    if (productId === "prod_mfg_001" || productId.includes("EcoSmart Refrigerator")) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        productId: "prod_mfg_001 / GTIN:01234567890123",
        basicInfo: {
          name: "EcoSmart Refrigerator X1000",
          brand: "GreenTech",
          model: "X1000",
          category: "Home Appliances",
          image: "https://placehold.co/600x400.png",
          description: "A premium, energy-efficient smart refrigerator designed for modern living. Features advanced cooling technology and sustainable materials."
        },
        sustainability: {
          carbonFootprint: "350kg CO2e",
          energyRating: "A+++",
          recyclability: "75%",
          highlights: ["Made with 30% recycled steel", "Low GWP refrigerant", "Extended component lifespan"],
          waterUsage: "N/A for refrigerators",
          renewableEnergySource: "Manufacturing partly powered by solar (25%)",
          sustainabilityScore: { // Added sustainability score
            score: 8.7,
            rating: 'Excellent',
            assessmentDetails: 'Based on high recyclability, use of recycled content, and A+++ energy rating.'
          }
        },
        materials: {
          composition: [
            { name: "Recycled Steel (Frame & Body)", percentage: "30%", source: "Certified Recycler Co.", isRecycled: true },
            { name: "ABS Plastic (Interior Liners)", percentage: "25%", source: "PetroChem Inc.", isRecycled: false },
            { name: "Tempered Glass (Shelves)", percentage: "15%", source: "GlassWorks Ltd.", isRecycled: false},
            { name: "Copper (Wiring & Pipes)", percentage: "5%", source: "MetalExtract Corp", isRecycled: false},
            { name: "Polyurethane Foam (Insulation)", percentage: "10%", source: "ChemFoam Solutions", isRecycled: false},
            { name: "Aluminum (Heat Exchanger)", percentage: "5%", source: "AluParts Fab", isRecycled: true },
            { name: "Minor Electronic Components", percentage: "10%", source: "Various Global Suppliers", isRecycled: false },
          ],
          hazardousSubstances: [
            { name: "Lead (Pb) in solder", concentration: "< 0.01%", notes: "RoHS Compliant" },
            { name: "Mercury (Hg) in lamps", concentration: "Not Present", notes: "Uses LED lighting" }
          ]
        },
        compliance: {
          verificationStatus: "Verified",
          verifiedDate: "2024-03-10",
          certifications: [
            { name: "CE Mark", issuer: "EU Notified Body 1234", link: "#", expiryDate: "2029-03-10", standard: "EN 60335-1, EN 62552" },
            { name: "Energy Star 8.0", issuer: "EPA", link: "#", expiryDate: "N/A", standard: "Energy Star Program Requirements for Refrigerators" },
            { name: "ISO 9001 (Manufacturer)", issuer: "QAS International", link: "#", expiryDate: "2026-05-20", standard: "ISO 9001:2015" }
          ],
          regulatoryCompliance: [
            { regulation: "EU Ecodesign Regulation 2019/2019", status: "Compliant", details: "Meets energy efficiency and repairability requirements." },
            { regulation: "EU RoHS Directive 2011/65/EU", status: "Compliant", details: "Restricted substances below threshold." },
            { regulation: "EU WEEE Directive 2012/19/EU", status: "Compliant", details: "Producer registered (WEEE ID: GT12345XYZ) and product labeled." }
          ]
        },
        lifecycle: {
          manufacturingDate: "2024-01-15",
          warrantyInfo: "5 years (compressor), 2 years (all other parts)",
          repairInstructions: "https://support.greentech.com/x1000/repair",
          recyclingInfo: "Contact GreenTech authorized recyclers or local WEEE collection points. See WEEE information on product.",
          expectedLifespan: "12-15 years",
          disassemblyGuideUrl: "https://support.greentech.com/x1000/disassembly"
        },
        trustIndicators: {
          verificationBadge: "https://placehold.co/120x40/8FBC8F/FFFFFF?text=EcoCert+Verified",
          dataSource: "GreenTech Manufacturer Portal & EcoCert Audits",
          lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString(),
          blockchainTransactionId: "0x123abc456def789000abcdef111fedcba222"
        },
        realTimeVerification: {
            status: 'Verified',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            verifier: 'RealTimeCertify System'
        }
      };
    }

    const response = await fetch(`/api/v1/public/products/${productId}`);
     if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API Error ${response.status}: ${errorData.error || response.statusText}`);
    }
    return await response.json() as ProductData;

  } catch (error) {
    console.error("Error fetching product from API:", error);
    throw error;
  }
}

const ProductHeaderCard: React.FC<{ name?: string, brand?: string, model?:string, category?: string, image?: string, description?: string }> = ({ name, brand, model, category, image, description }) => (
  <Card className="shadow-xl overflow-hidden border border-border bg-card">
    <CardHeader className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
        {image && (
          <div className="w-full md:w-1/3 lg:w-1/4 h-48 md:h-64 min-h-[150px] relative rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted">
            <Image src={image} alt={name || "Product Image"} layout="fill" objectFit="contain" data-ai-hint="product item photo"/>
          </div>
        )}
        <div className={cn("flex-1", image ? "md:w-2/3 lg:w-3/4" : "w-full")}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-space-grotesk font-bold text-primary mb-1">{name || "N/A"}</h1>
          <p className="text-md md:text-lg text-muted-foreground mb-2">{brand || "N/A"} - {model || "N/A"}</p>
          {category && <Badge variant="secondary" className="text-xs md:text-sm mb-3">{category}</Badge>}
          {description && <p className="text-sm text-foreground leading-relaxed font-inter">{description}</p>}
        </div>
      </div>
    </CardHeader>
  </Card>
);

const DetailCard: React.FC<{title: string, icon: React.ElementType, children: React.ReactNode, iconColor?: string, dataPresent?: boolean, id?: string}> = ({ title, icon: Icon, children, iconColor = "text-primary", dataPresent = true, id }) => {
  if (!dataPresent) return null;
  return (
    <Card className="shadow-md border border-border bg-card h-full flex flex-col" id={id}>
      <CardHeader className="pb-3 pt-4 px-4 md:px-6">
        <CardTitle className="font-space-grotesk text-lg md:text-xl flex items-center text-foreground">
            <Icon className={`mr-2 h-5 w-5 ${iconColor}`}/>{title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm px-4 md:px-6 pb-4 flex-grow">
        {children}
      </CardContent>
    </Card>
  );
};

const InfoItem: React.FC<{label: string, value?: string | React.ReactNode | null, icon?: React.ElementType, badge?: boolean, badgeVariant?: "default" | "secondary" | "destructive" | "outline", className?: string }> = ({label, value, icon: Icon, badge, badgeVariant, className}) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) return null;
  return (
    <div className={cn("flex items-start py-1", className)}>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0"/>}
      <span className="font-medium text-foreground min-w-[100px] md:min-w-[140px] flex-shrink-0">{label}:</span>
      {badge ? <Badge variant={badgeVariant || 'secondary'} className="ml-2 text-xs">{value}</Badge>
             : React.isValidElement(value) ? <div className="ml-2 flex-grow">{value}</div>
             : <span className="ml-2 text-muted-foreground break-words flex-grow">{value}</span>}
    </div>
  );
};

const PublicProductDisplayPageContent = () => {
  const params = useParams();
  const productIdParam = Array.isArray(params.productId) ? params.productId[0] : params.productId;
  const productId = typeof productIdParam === 'string' ? decodeURIComponent(productIdParam) : '';

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveVerificationStatus, setLiveVerificationStatus] = useState<ProductData['realTimeVerification'] | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (productId) {
      setLoading(true);
      setError(null);
      getPublicProductFromAPI(productId)
        .then(data => {
          if (!isMounted) return;
          setProduct(data);
          if (!data) {
            setError(`Product not found for ID: "${productId}". Please verify the QR code or link.`);
          } else if (data.realTimeVerification) {
            setLiveVerificationStatus(data.realTimeVerification);
            const timer = setTimeout(() => {
                if(isMounted) {
                    setLiveVerificationStatus(prev => prev ? {...prev, timestamp: new Date().toISOString(), status: prev.status === 'Verified' ? 'Pending' : 'Verified' } : null);
                }
            }, 15000);
            return () => clearTimeout(timer);
          }
        })
        .catch(err => {
          if (!isMounted) return;
          console.error("Failed to fetch product data:", err);
          setError(`An error occurred while fetching product data: ${err.message || "Please try again later."}`);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
      setError("No product ID provided in the URL.");
    }
    return () => { isMounted = false; };
  }, [productId]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-128px)]">
        <Card className="w-full max-w-lg p-6 md:p-8 text-center border-border bg-card">
          <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-inter">Loading product information...</p>
        </Card>
      </div>
    );
  }

  if (error || !product) {
     return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-128px)]">
        <Card className="w-full max-w-lg p-6 md:p-8 text-center border-destructive bg-card">
          <AlertTriangle className="h-10 w-10 md:h-12 md:w-12 text-destructive mx-auto mb-4" />
          <CardHeader className="p-0"><CardTitle className="font-space-grotesk text-xl md:text-2xl text-destructive">Product Information Error</CardTitle></CardHeader>
          <CardContent className="p-0 mt-2"><p className="text-sm text-foreground font-inter">{error || "Product data could not be loaded."}</p></CardContent>
           <CardFooter className="pt-6 justify-center">
            <Button asChild variant="outline">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const getVerificationStatusDisplay = (status?: ProductData['compliance']['verificationStatus'], date?: string, liveStatus?: ProductData['realTimeVerification']) => {
    let icon;
    let textClass = "text-foreground";
    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let currentStatusToDisplay = status;
    let statusText: string | React.ReactNode = status || 'Not Assessed';
    let dateSuffix = date ? ` (as of ${new Date(date).toLocaleDateString()})` : '';

    if (liveStatus) {
        currentStatusToDisplay = liveStatus.status as ProductData['compliance']['verificationStatus'];
        statusText = (
          <div className="flex items-center">
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE: {liveStatus.status}
          </div>
        );
        dateSuffix = `(${new Date(liveStatus.timestamp).toLocaleTimeString()})`;
    }

    switch (currentStatusToDisplay) {
        case 'Verified':
            icon = <ShieldCheck className="h-4 w-4 mr-1.5" />;
            textClass = "text-accent-foreground";
            badgeVariant = "default";
            break;
        case 'Pending':
            icon = <Clock className="h-4 w-4 mr-1.5" />;
            textClass = "text-yellow-700";
            badgeVariant = "secondary";
            break;
        case 'Failed':
            icon = <AlertTriangle className="h-4 w-4 mr-1.5" />;
            textClass = "text-destructive-foreground";
            badgeVariant = "destructive";
            break;
        case 'Self-Asserted':
            icon = <Info className="h-4 w-4 mr-1.5" />;
            textClass = "text-blue-700";
            badgeVariant = "secondary";
            break;
        default: 
            icon = <Search className="h-4 w-4 mr-1.5" />;
            textClass = "text-muted-foreground";
    }
    return <Badge variant={badgeVariant} className={cn("text-xs py-1 px-2.5 font-medium items-center", textClass, currentStatusToDisplay === 'Verified' ? 'bg-accent hover:bg-accent/90' : currentStatusToDisplay === 'Pending' ? 'bg-yellow-400/20 border-yellow-500/50' : currentStatusToDisplay === 'Failed' ? 'bg-destructive hover:bg-destructive/90' : currentStatusToDisplay === 'Self-Asserted' ? 'bg-blue-400/20 border-blue-500/50' : 'bg-muted/80')}> {icon} {statusText} {dateSuffix}</Badge>;
  };

  const getScoreColor = (rating: ProductData['sustainability']['sustainabilityScore']['rating']) => {
    switch(rating) {
      case 'Excellent': return 'text-accent';
      case 'Good': return 'text-green-600';
      case 'Fair': return 'text-yellow-500';
      case 'Poor': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };


  return (
    <div className="product-passport-display container mx-auto py-6 md:py-8 px-4 space-y-6 font-inter">
      <ProductHeaderCard
        name={product.basicInfo.name}
        brand={product.basicInfo.brand}
        model={product.basicInfo.model}
        category={product.basicInfo.category}
        image={product.basicInfo.image}
        description={product.basicInfo.description}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {product.sustainability?.sustainabilityScore && (
          <DetailCard title="Overall Sustainability Score" icon={Award} iconColor="text-yellow-500" dataPresent={!!product.sustainability.sustainabilityScore} id="sustainability-score">
            <div className="text-center py-2">
              <p className={`text-4xl font-bold ${getScoreColor(product.sustainability.sustainabilityScore.rating)}`}>
                {product.sustainability.sustainabilityScore.score.toFixed(1)}
                <span className="text-2xl text-muted-foreground"> / 10</span>
              </p>
              <p className={`text-lg font-semibold mt-1 ${getScoreColor(product.sustainability.sustainabilityScore.rating)}`}>
                {product.sustainability.sustainabilityScore.rating}
              </p>
              {product.sustainability.sustainabilityScore.assessmentDetails && (
                <p className="text-xs text-muted-foreground mt-3">{product.sustainability.sustainabilityScore.assessmentDetails}</p>
              )}
            </div>
          </DetailCard>
        )}

        <DetailCard title="Sustainability Profile" icon={Leaf} iconColor="text-accent" dataPresent={!!product.sustainability} id="sustainability">
          <InfoItem label="Energy Rating" value={product.sustainability?.energyRating} badge badgeVariant={product.sustainability?.energyRating?.startsWith("A") ? "default" : "secondary"} />
          <InfoItem label="Carbon Footprint" value={product.sustainability?.carbonFootprint} />
          <InfoItem label="Recyclability" value={product.sustainability?.recyclability} />
          <InfoItem label="Water Usage" value={product.sustainability?.waterUsage} />
          <InfoItem label="Renewable Energy Used" value={product.sustainability?.renewableEnergySource} />
          {product.sustainability?.highlights && product.sustainability.highlights.length > 0 && (
            <div className="mt-1">
              <strong className="text-sm font-medium text-foreground block mb-1">Key Highlights:</strong>
              <ul className="list-disc list-inside pl-1 space-y-0.5 text-xs text-muted-foreground">
                {product.sustainability.highlights.map((hl, i) => <li key={i}>{hl}</li>)}
              </ul>
            </div>
          )}
        </DetailCard>

        <DetailCard title="Materials & Composition" icon={Factory} dataPresent={!!(product.materials?.composition?.length || product.materials?.hazardousSubstances?.length)} id="materials">
           {product.materials?.composition && product.materials.composition.length > 0 && (
            <div className="mb-3">
              <strong className="text-sm font-medium text-foreground block mb-1.5">Key Materials:</strong>
              <ul className="space-y-1.5">
                {product.materials.composition.map((mat, i) => (
                  <li key={i} className="p-2 bg-muted/50 rounded text-xs border border-border/50">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{mat.name}</span>
                        {mat.percentage && <Badge variant="outline" className="text-xs">{mat.percentage}</Badge>}
                    </div>
                    {mat.isRecycled && <span className="text-xs text-accent font-medium block mt-0.5">Contains Recycled Content</span>}
                    {mat.source && <span className="block text-xs text-muted-foreground/80">Source: {mat.source}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.materials?.hazardousSubstances && product.materials.hazardousSubstances.length > 0 && (
            <div>
              <strong className="text-sm font-medium text-foreground block mb-1.5">Hazardous Substances Notes:</strong>
               <ul className="space-y-1.5">
                {product.materials.hazardousSubstances.map((sub, i) => (
                  <li key={i} className="p-2 bg-destructive/5 rounded text-xs border border-destructive/20">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-destructive/90">{sub.name}</span>
                        {sub.concentration && <span className="text-destructive/80 text-xs">({sub.concentration})</span>}
                    </div>
                    {sub.notes && <span className="block text-xs text-destructive/70 mt-0.5">Note: {sub.notes}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DetailCard>

        <DetailCard title="Compliance & Certifications" icon={ShieldCheck} iconColor="text-green-600" dataPresent={!!product.compliance} id="compliance">
          <div className="mb-3">
            <strong className="text-sm font-medium text-foreground block mb-1">Overall Verification Status:</strong>
            {getVerificationStatusDisplay(product.compliance?.verificationStatus, product.compliance?.verifiedDate, liveVerificationStatus)}
          </div>
          {product.compliance?.regulatoryCompliance && product.compliance.regulatoryCompliance.length > 0 && (
            <div className="mt-2">
              <strong className="text-sm font-medium text-foreground block mb-1.5">Regulatory Compliance:</strong>
              <ul className="space-y-1.5">
                {product.compliance.regulatoryCompliance.map((reg, i) => (
                  <li key={i} className={cn("p-2 border rounded-md text-xs flex justify-between items-center", reg.status === "Compliant" ? "bg-accent/10 border-accent/40" : "bg-destructive/10 border-destructive/40")}>
                    <span className={cn("font-medium", reg.status === "Compliant" ? "text-accent-foreground" : "text-destructive-foreground")}>{reg.regulation}</span>
                    <Badge variant={reg.status === "Compliant" ? "default" : "destructive"} className={cn(reg.status === "Compliant" ? "bg-accent text-accent-foreground" : "")}>{reg.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.compliance?.certifications && product.compliance.certifications.length > 0 && (
            <div className="mt-3">
              <strong className="text-sm font-medium text-foreground block mb-1.5">Certifications:</strong>
              <ul className="space-y-2">
                {product.compliance.certifications.map((cert, i) => (
                  <li key={i} className="p-2.5 border rounded-md text-xs bg-muted/50">
                    <div className="font-semibold text-foreground">{cert.name}</div>
                    <div className="text-muted-foreground/90 text-xs">Standard: {cert.standard || 'N/A'}</div>
                    <div className="text-muted-foreground/90 text-xs">Issuer: {cert.issuer}</div>
                    {cert.expiryDate && <div className="text-muted-foreground/90 text-xs">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</div>}
                    {cert.link && <Button variant="link" size="xs" asChild className="p-0 h-auto text-primary mt-0.5"><Link href={cert.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-0.5"/>View Certificate</Link></Button>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DetailCard>

        <DetailCard title="Product Lifecycle Information" icon={Recycle} iconColor="text-blue-600" dataPresent={!!product.lifecycle} id="lifecycle">
          <InfoItem icon={CalendarDays} label="Manufacturing Date" value={product.lifecycle?.manufacturingDate ? new Date(product.lifecycle.manufacturingDate).toLocaleDateString() : null} />
          <InfoItem icon={Wrench} label="Warranty Information" value={product.lifecycle?.warrantyInfo} />
          <InfoItem icon={Recycle} label="Expected Product Lifespan" value={product.lifecycle?.expectedLifespan} />
          {product.lifecycle?.repairInstructions && (
            <InfoItem icon={Wrench} label="Repair Information" value={
                product.lifecycle.repairInstructions.startsWith('http') ?
                    <Button variant="link" size="xs" asChild className="p-0 h-auto text-primary"><Link href={product.lifecycle.repairInstructions} target="_blank" rel="noopener noreferrer">View Instructions <ExternalLink className="h-3 w-3 mr-0.5"/></Link></Button>
                    : <span className="text-muted-foreground break-words"> {product.lifecycle.repairInstructions}</span>
            }/>
          )}
           {product.lifecycle?.disassemblyGuideUrl && (
            <InfoItem icon={Recycle} label="Disassembly Guide" value={
                <Button variant="link" size="xs" asChild className="p-0 h-auto text-primary"><Link href={product.lifecycle.disassemblyGuideUrl} target="_blank" rel="noopener noreferrer">View Guide <ExternalLink className="h-3 w-3 mr-0.5"/></Link></Button>
            }/>
          )}
          <InfoItem icon={Info} label="Detailed Recycling Info" value={product.lifecycle?.recyclingInfo} />
        </DetailCard>

        <DetailCard title="Trust Indicators & Verification" icon={ThumbsUp} dataPresent={!!product.trustIndicators} iconColor="text-primary" id="trust">
          {product.trustIndicators?.verificationBadge &&
            <div className="mb-3 text-center">
                <Image src={product.trustIndicators.verificationBadge} alt="Verification Badge" width={120} height={40} data-ai-hint="verification badge" className="inline-block border rounded"/>
            </div>
          }
          <InfoItem icon={Database} label="Primary Data Source" value={product.trustIndicators?.dataSource} />
          <InfoItem icon={Info} label="Blockchain Transaction ID" value={product.trustIndicators?.blockchainTransactionId ? `${product.trustIndicators.blockchainTransactionId.substring(0,10)}...${product.trustIndicators.blockchainTransactionId.slice(-8)}` : null} />
          {product.trustIndicators?.blockchainTransactionId && <Button variant="link" size="xs" className="p-0 h-auto ml-6 text-xs" onClick={() => alert('View on Blockchain Explorer (mock)')}><ExternalLink className="h-3 w-3 mr-0.5"/>View on Explorer</Button>}
          <InfoItem icon={CalendarDays} label="Data Last Updated" value={product.trustIndicators?.lastUpdated ? new Date(product.trustIndicators.lastUpdated).toLocaleString() : null} />
           {liveVerificationStatus && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <strong className="text-sm font-medium text-foreground block mb-1">Live Status Check:</strong>
                {getVerificationStatusDisplay(undefined, undefined, liveVerificationStatus)}
              </div>
          )}
        </DetailCard>

        <Card className="shadow-md border border-border bg-card h-full lg:col-span-1" id="qr-actions">
            <CardHeader className="pb-3 pt-4 px-4 md:px-6">
                <CardTitle className="font-space-grotesk text-lg md:text-xl flex items-center text-foreground">
                    <Search className={`mr-2 h-5 w-5 text-primary`}/>Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm px-4 md:px-6 pb-4">
               <Button variant="outline" className="w-full justify-start" asChild>
                   <Link href="#sustainability"><Leaf className="mr-2 h-4 w-4 text-accent"/>Jump to Sustainability</Link>
               </Button>
               <Button variant="outline" className="w-full justify-start" asChild>
                   <Link href="#compliance"><ShieldCheck className="mr-2 h-4 w-4 text-green-600"/>Jump to Compliance</Link>
               </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => alert('Share DPP functionality (Placeholder)')}>
                    <ExternalLink className="mr-2 h-4 w-4 text-blue-600"/> Share Product Passport
                </Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => alert('Download PDF functionality (Placeholder)')}>
                    <Download className="mr-2 h-4 w-4 text-primary"/> Download as PDF
                </Button>
            </CardContent>
        </Card>

      </div>

      <CardFooter className="text-center text-xs text-muted-foreground mt-6 md:mt-8 pt-4 border-t border-border">
          Powered by Norruva. Data provided by {product.basicInfo.brand || "the manufacturer"}.
          {product.trustIndicators?.lastUpdated && ` Last data update: ${new Date(product.trustIndicators.lastUpdated).toLocaleDateString()}.`}
           {liveVerificationStatus && ` Live status refreshed: ${new Date(liveVerificationStatus.timestamp).toLocaleTimeString()}.`}
      </CardFooter>
    </div>
  );
};

export default function PublicProductDisplayPage() {
  return (
    <>
      <AppHeader />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }>
        <PublicProductDisplayPageContent />
      </Suspense>
    </>
  );
}
