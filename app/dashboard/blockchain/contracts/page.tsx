
// src/app/dashboard/blockchain/contracts/page.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code, Copy, Download, Layers, Info, FileText, Link as LinkIcon, ShieldCheck, ExternalLink } from 'lucide-react'; // Added ExternalLink
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge'; // Added missing import

interface ContractInfo {
  name: string;
  symbol?: string;
  address: string; // Could be environment specific
  version: string;
  description: string;
  explorerLink?: string; // Link to block explorer for this contract
  abiSnippet: string; // A small snippet or link to full ABI
  auditStatus?: 'Audited' | 'Pending Audit' | 'Not Audited';
  deployedDate?: string;
  network?: 'Mainnet' | 'Testnet (Polygon Mumbai)' | 'Localhost';
}

const mockContracts: ContractInfo[] = [
  {
    name: 'DPP NFT Contract (DPPNFT)',
    symbol: 'DPPNFT',
    address: '0xMockDPPNFTContractAddress001...Cafe',
    version: '1.2.0',
    description: 'Manages the creation, ownership, and metadata of Digital Product Passport NFTs.',
    explorerLink: '#',
    abiSnippet: '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],...}]',
    auditStatus: 'Audited',
    deployedDate: '2024-05-10',
    network: 'Testnet (Polygon Mumbai)',
  },
  {
    name: 'NORU Utility Token (NORU)',
    symbol: 'NORU',
    address: '0xMockNoruTokenContractAddress002...Beef',
    version: '1.0.5',
    description: 'The native utility token for the Norruva platform, used for staking, fees, and governance.',
    explorerLink: '#',
    abiSnippet: '[{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],...}]',
    auditStatus: 'Audited',
    deployedDate: '2024-03-15',
    network: 'Testnet (Polygon Mumbai)',
  },
  {
    name: 'DAO Governance Contract',
    address: '0xMockDAOGovernanceAddress003...Dead',
    version: '1.0.0',
    description: 'Smart contract for managing governance proposals, voting, and execution within the Norruva DAO.',
    explorerLink: '#',
    abiSnippet: '[{"constant":false,"inputs":[{"name":"proposalId","type":"uint256"}],"name":"execute",...}]',
    auditStatus: 'Pending Audit',
    deployedDate: '2024-06-20',
    network: 'Testnet (Polygon Mumbai)',
  },
  {
    name: 'Staking Pool Contract',
    address: '0xMockStakingPoolAddress004...Babe',
    version: '1.1.0',
    description: 'Contract for staking NORU tokens to earn rewards and participate in platform activities.',
    explorerLink: '#',
    abiSnippet: '[{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"stake",...}]',
    auditStatus: 'Audited',
    deployedDate: '2024-04-25',
    network: 'Testnet (Polygon Mumbai)',
  }
];


export default function ContractsInfoPage() {
  const { toast } = useToast();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: `${label} Copied!`, description: `${text.substring(0,30)}... copied to clipboard.`}))
      .catch(() => toast({ variant: "destructive", title: "Copy Failed"}));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold text-primary flex items-center">
        <Layers className="mr-3 h-8 w-8" />Smart Contract Information
      </h1>
      <CardDescription>
        Details about the core smart contracts powering the Norruva platform on the blockchain.
        Addresses shown are for the Testnet (Polygon Mumbai) environment.
      </CardDescription>

      <div className="space-y-4">
        {mockContracts.map((contract) => (
          <Card key={contract.name} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-xl flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary"/>{contract.name} {contract.symbol && `(${contract.symbol})`}
                    </CardTitle>
                    <CardDescription>Version: {contract.version} | Network: {contract.network}</CardDescription>
                </div>
                {contract.auditStatus && (
                    <Badge variant={contract.auditStatus === 'Audited' ? 'default' : 'secondary'} className={contract.auditStatus === 'Audited' ? 'bg-accent text-accent-foreground' : 'bg-yellow-400/80 text-yellow-900'}>
                       <ShieldCheck className="mr-1 h-3 w-3"/> {contract.auditStatus}
                    </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{contract.description}</p>
              <div>
                <span className="text-xs font-semibold text-foreground">Address:</span>
                <div className="flex items-center gap-2 font-mono text-xs p-2 bg-muted rounded-md">
                  <span className="truncate">{contract.address}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(contract.address, 'Address')} title="Copy Address">
                    <Copy className="h-3 w-3"/>
                  </Button>
                  {contract.explorerLink && (
                    <Button variant="link" size="xs" asChild className="p-0 h-auto">
                      <a href={contract.explorerLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-3 w-3"/>View on Explorer</a>
                    </Button>
                  )}
                </div>
              </div>
              {contract.deployedDate && <p className="text-xs text-muted-foreground">Deployed: {contract.deployedDate}</p>}
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="abi">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">View ABI Snippet</AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs p-3 bg-muted rounded-md max-h-40 overflow-auto relative">
                        <code>{contract.abiSnippet}</code>
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => handleCopy(contract.abiSnippet, 'ABI Snippet')} title="Copy ABI Snippet">
                            <Copy className="h-3 w-3"/>
                        </Button>
                    </pre>
                    <Button variant="link" size="sm" className="mt-1 p-0 h-auto">Download Full ABI (JSON)</Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6 bg-blue-500/5 border-blue-500/20">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Info className="h-5 w-5 text-blue-600"/>
            <CardTitle className="font-headline text-blue-700 text-base">For Developers</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-600 space-y-1">
            <p>These contract addresses and ABIs are essential for interacting with the Norruva platform programmatically. Ensure you are using the correct addresses for your target network (Mainnet/Testnet).</p>
            <p>Full contract source code and detailed documentation can be found in our developer portal (Placeholder for link).</p>
        </CardContent>
      </Card>
    </div>
  );
}

