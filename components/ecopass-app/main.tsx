
"use client";
import React, { useState, useEffect, useContext, createContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Shield, CheckCircle, Globe, Factory, Recycle, Award, ExternalLink, Menu, X, User, Settings, BarChart3, Package, QrCode, FileCheck, Bell, ChevronRight, Layers, ScanLine } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import QRScanHandler from './qr-scan-handler'; // Import the new QRScanHandler

// Norruva Logo SVG Component
const NorruvaLogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("h-8 w-8", className)}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 12C16 10.8954 16.8954 10 18 10H32C33.1046 10 34 10.8954 34 12V48L18 54C16.8954 54 16 53.1046 16 52V12Z"
      fill="hsl(var(--primary))"
    />
    <path
      d="M48 52C48 53.1046 47.1046 54 46 54H32C30.8954 54 30 53.1046 30 52V16L46 10C47.1046 10 48 10.8954 48 12V42L52 46L48 52Z"
      fill="hsl(var(--accent))"
    />
    <path
      d="M22 18L40 40L43 37L25 15L22 18Z"
      fill="hsl(var(--primary-foreground))"
    />
    <path
      d="M28 26L46 48L49 45L31 23L28 26Z"
      fill="hsl(var(--primary-foreground))"
    />
  </svg>
);


// Mock data for demonstration
const mockProducts = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    gtin: '1234567890123',
    name: 'NorruvaFridge Pro A+++',
    brand: 'NorruvaAppliances',
    model: 'NFP-2024',
    category: 'electronics',
    energyClass: 'A+++',
    carbonFootprint: 145.5,
    recyclability: 85,
    status: 'verified',
    verificationDate: '2024-12-15',
    verifiedBy: 'TÜV SÜD',
    credentialId: 'ebsi-12345',
    materials: [
      { name: 'Steel', percentage: 45 },
      { name: 'Plastic', percentage: 25 },
      { name: 'Aluminum', percentage: 20 },
      { name: 'Electronics', percentage: 10 }
    ]
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440011',
    gtin: '9876543210987',
    name: 'Norruva Power Drill',
    brand: 'BuildNorruva',
    model: 'ND-500',
    category: 'electronics',
    energyClass: 'A+',
    carbonFootprint: 25.2,
    recyclability: 70,
    status: 'pending',
    verificationDate: null,
    verifiedBy: null,
    credentialId: null,
    materials: [
      { name: 'Recycled Plastic Housing', percentage: 60 },
      { name: 'Steel Motor', percentage: 30 },
      { name: 'Copper Wiring', percentage: 10 }
    ]
  }
];

// Define types for AuthContext
interface UserType {
  uid: string;
  email?: string; 
  displayName: string;
  role: string; // e.g., 'manufacturer', 'admin', 'viewer'
  companyId: string;
}

interface AuthContextType {
  user: UserType | null;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Authentication Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setUser({ 
        uid: 'demo-user-norruva',
        email: 'demo@norruva.com',
        displayName: 'Demo Norruva User',
        role: 'manufacturer',
        companyId: 'norruva-comp-123'
      });
      setLoading(false);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  const login = async (email?: string, password?: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      uid: 'demo-user-norruva',
      email: email || 'demo@norruva.com', 
      displayName: 'Demo Norruva User',
      role: 'manufacturer',
      companyId: 'norruva-comp-123'
    });
    setLoading(false);
  };

  const logout = () => {
    setLoading(true);
    setUser(null);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Header Component
const HeaderComponent = ({ onMenuToggle, showMobileMenu }: { onMenuToggle: () => void; showMobileMenu: boolean }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Toggle sidebar"
            >
              {showMobileMenu ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center ml-4 lg:ml-0">
              <NorruvaLogoIcon />
              <span className="ml-2 text-xl font-headline font-bold text-foreground">Norruva</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative" aria-label="Notifications">
              <Bell />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
            </Button>
            
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="text-primary" />
                </div>
                <span className="ml-2 text-foreground hidden sm:block">{user?.displayName || 'User'}</span>
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-50 border border-border">
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                    Profile Settings
                  </Link>
                  <a href="#" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted">
                    API Keys (Placeholder)
                  </a>
                  <Button
                    variant="ghost"
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Sidebar Navigation
const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigation = [
    { name: 'App Home', icon: BarChart3, href: '/app', current: true }, // Changed Label, kept href
    { name: 'Scan Product', icon: QrCode, href: '#qr-codes', current: false, disabled: false }, // Enabled for new scanner
    { name: 'Browse Public DPPs', icon: Package, href: '#public-dpps', current: false, disabled: true }, // Placeholder
    { name: 'Help & Support', icon: Shield, href: '#help', current: false, disabled: true }, // Placeholder
    { type: 'divider', key: 'div1' },
    { name: 'Developer Portal', icon: Layers, href: '/studio', current: false }, 
    { name: 'Partner Dashboard', icon: Settings, href: '/dashboard', current: false }, // Link to main partner dashboard
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        >
          <div className="fixed inset-0 bg-black/60"></div> 
        </div>
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-border",
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                if (item.type === 'divider') {
                  return <hr key={item.key} className="my-2 border-border" />;
                }
                return (
                  <Button
                    key={item.name}
                    asChild={!item.disabled && item.href !== '#qr-codes'} // Link for actual hrefs, not for QR trigger
                    variant="ghost"
                    onClick={item.href === '#qr-codes' ? (e) => { 
                      e.preventDefault(); 
                      // This assumes a way to trigger the QR scanner modal from here, 
                      // e.g., by calling a function passed down via context or prop.
                      // For simplicity, we'll rely on the main dashboard button for now.
                      // To make this sidebar button work, `setShowQRScanner(true)` from main would need to be accessible.
                      console.log("Sidebar Scan Product clicked - needs modal trigger logic from parent");
                      onClose(); 
                    } : onClose}
                    className={cn(
                      "w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground",
                      item.current && "bg-accent/20 text-accent-foreground font-semibold",
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={item.disabled}
                  >
                    {item.href === '#qr-codes' || item.disabled ? (
                      <span className="flex items-center w-full">
                        <item.icon
                          className={cn(
                            item.current ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground',
                            'mr-3 flex-shrink-0 h-6 w-6'
                          )}
                        />
                        {item.name}
                      </span>
                    ) : (
                      <Link
                        href={item.href!}
                        className="flex items-center w-full"
                      >
                        <item.icon
                          className={cn(
                            item.current ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground',
                            'mr-3 flex-shrink-0 h-6 w-6'
                          )}
                        />
                        {item.name}
                      </Link>
                    )}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};


// Dashboard Stats
const DashboardStats = () => {
  const stats = [
    { name: 'Total Products', value: '1,247', change: '+12%', changeType: 'increase' as 'increase' | 'decrease' },
    { name: 'Verified Products', value: '1,089', change: '+8%', changeType: 'increase' as 'increase' | 'decrease' },
    { name: 'QR Scans (30d)', value: '45,231', change: '+23%', changeType: 'increase' as 'increase' | 'decrease' },
    { name: 'API Calls (30d)', value: '2.4M', change: '+15%', changeType: 'increase' as 'increase' | 'decrease' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-card overflow-hidden shadow rounded-lg border border-border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-primary" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                    <div className={cn("ml-2 flex items-baseline text-sm font-semibold", stat.changeType === 'increase' ? 'text-accent' : 'text-destructive')}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }: { product: typeof mockProducts[0] }) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-accent text-accent-foreground';
      case 'pending': return 'bg-yellow-400 text-yellow-900'; 
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 border border-border">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.brand} • {product.model}</p>
            <p className="text-xs text-muted-foreground/80 mt-1">GTIN: {product.gtin}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusBadgeClass(product.status))}>
              {product.status}
            </span>
            {product.energyClass && (
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold">
                {product.energyClass}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Carbon Footprint</div>
            <div className="text-lg font-semibold text-orange-500">{product.carbonFootprint} kg CO₂e</div> 
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Recyclability</div>
            <div className="text-lg font-semibold text-accent">{product.recyclability}%</div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="text-primary mr-1 h-4 w-4" /> Verified by {product.verifiedBy || 'N/A'}
          </div>
          <Button variant="link" size="sm" className="text-primary hover:text-primary/80">View Details <ChevronRight className="h-4 w-4"/></Button>
        </div>
      </div>
    </div>
  );
};

// Products Grid
const ProductsGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="battery">Batteries</option>
          <option value="textile">Textiles</option>
          <option value="furniture">Furniture</option>
        </select>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Create Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
         {filteredProducts.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-10">No products match your criteria.</p>
        )}
      </div>
    </div>
  );
};

// Public Product Viewer (for QR code scans)
const PublicProductViewer = ({ productId }: { productId: string }) => {
  const [product, setProduct] = useState<typeof mockProducts[0] | null>(null);
  const [loadingView, setLoadingView] = useState(true); 

  useEffect(() => {
    setLoadingView(true);
    const foundProduct = mockProducts.find(p => p.id === productId || p.gtin === productId);
    setTimeout(() => {
      setProduct(foundProduct || null);
      setLoadingView(false);
    }, 300);
  }, [productId]);

  if (loadingView) return <LoadingSpinner />;
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
        <div>
          <Package className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">The product ID '{productId}' does not match any known product in our records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
           <NorruvaLogoIcon />
           <span className="ml-2 text-xl font-headline font-bold text-foreground">Norruva Product Passport</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-card rounded-lg shadow-sm p-6 mb-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-headline font-bold text-foreground">{product.name}</h1>
              <p className="text-lg text-muted-foreground mt-2">{product.brand} • {product.model}</p>
              <p className="text-sm text-muted-foreground/80 mt-1">GTIN: {product.gtin}</p>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-accent h-6 w-6" />
              <span className="text-sm font-medium text-accent-foreground">Verified Product</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
              <Globe className="text-primary mr-2 h-5 w-5" />
              Energy Efficiency
            </h3>
            <div className="flex items-center justify-center">
              <div className="bg-accent text-accent-foreground px-8 py-4 rounded-lg text-center">
                <div className="text-3xl font-bold">{product.energyClass}</div>
                <div className="text-sm">Energy Class</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Annual energy consumption: 150 kWh/year (Example)
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
               <NorruvaLogoIcon className="h-5 w-5 text-accent mr-2" /> 
              Environmental Impact
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Carbon Footprint</span>
                <span className="text-lg font-bold text-orange-500">{product.carbonFootprint} kg CO₂e</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Recyclability</span>
                <div className="flex items-center">
                  <div className="w-16 bg-muted rounded-full h-2 mr-2">
                    <div 
                      className="bg-accent h-2 rounded-full" 
                      style={{ width: `${product.recyclability}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-foreground">{product.recyclability}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
              <Factory className="text-muted-foreground mr-2 h-5 w-5" />
              Materials
            </h3>
            <div className="space-y-2">
              {product.materials.map((material, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-foreground">{material.name}</span>
                  <span className="text-muted-foreground">{material.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
              <Recycle className="text-primary mr-2 h-5 w-5" />
              End of Life
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-sm text-foreground">Recycling Instructions:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Remove all cables before disposal. Take to certified WEEE recycling center.
                </p>
              </div>
              <div>
                <span className="font-medium text-sm text-foreground">Takeback Program:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Free collection service available through manufacturer website.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-accent/10 border border-accent/30 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="text-accent h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-accent-foreground">
                Verified Digital Product Passport
              </h3>
              <div className="mt-1 text-sm text-accent-foreground/80">
                Data verified on {product.verificationDate} by {product.verifiedBy || 'Norruva System'}
                {product.credentialId && (
                  <span className="block mt-1">
                    Blockchain credential: {product.credentialId}
                    <ExternalLink className="h-3 w-3 inline ml-1" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// QR Code Scanner Modal
const QRScannerModal = ({ isOpen, onClose, onScanSuccess }: { isOpen: boolean; onClose: () => void; onScanSuccess: (productId: string) => void; }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose} aria-hidden="true">
          <div className="absolute inset-0 bg-black/75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-border">
          <div className="bg-card px-4 pt-5 pb-4 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-foreground mb-2 text-center flex items-center justify-center gap-2">
              <ScanLine className="h-5 w-5" /> Scan Product QR Code
            </h3>
            <QRScanHandler onScanSuccess={onScanSuccess} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component (Partner Dashboard)
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);
  const router = useRouter(); // For navigation

  // This effect tries to read the initial route if this dashboard is handling sub-routes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.startsWith('/dashboard/')) {
        setActivePage(path.split('/dashboard/')[1] || 'overview');
      } else if (path === '/app') {
        setActivePage('overview');
      }
    }
  }, []);

   const handleQrScannedAndNavigate = (productId: string) => {
    // Update URL to show public product viewer with the scanned ID
    // This assumes EcoTraceApp will re-render based on URL changes to show PublicProductViewer
    // Or, if this Dashboard component *is* the main app router, it updates its own state.
    // For this example, we'll use router.push to navigate to the public product viewer.
    router.push(`/product/${productId}`);
    setShowQRScanner(false); // Close the scanner modal
  };


  let currentPageContent = (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-foreground">App Overview</h1>
        <Button
          onClick={() => setShowQRScanner(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          <ScanLine /> 
          Scan Product QR
        </Button>
      </div>
      <DashboardStats />
      <div className="mt-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Recent Products (App View)</h2>
        <ProductsGrid />
      </div>
    </>
  );

  // Simple content router for the demo
  if (activePage === 'products') {
    currentPageContent = (
      <>
        <h1 className="text-2xl font-semibold text-foreground mb-8">Product Management</h1>
        <ProductsGrid />
      </>
    );
  } else if (activePage === 'settings') {
     currentPageContent = (
      <>
        <h1 className="text-2xl font-semibold text-foreground mb-8">Profile Settings (Placeholder)</h1>
        <p className="text-muted-foreground">Profile settings content would appear here.</p>
      </>
    );
  } else if (activePage === 'compliance') {
    currentPageContent = (
      <>
        <h1 className="text-2xl font-semibold text-foreground mb-8">Compliance Center (Placeholder)</h1>
        <p className="text-muted-foreground">Compliance check tools and reports would appear here.</p>
      </>
    )
  }


  return (
    <div className="h-screen flex overflow-hidden bg-background"> 
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <HeaderComponent 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          showMobileMenu={sidebarOpen}
        />

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {currentPageContent}
            </div>
          </div>
        </main>
      </div>

      <QRScannerModal 
        isOpen={showQRScanner} 
        onClose={() => setShowQRScanner(false)} 
        onScanSuccess={handleQrScannedAndNavigate}
      />
    </div>
  );
};

// Login Component
const Login = () => {
  const { login, loading: authIsLoading } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      // After successful mock login, AppController's useEffect will handle redirection
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
             <NorruvaLogoIcon className="h-12 w-12 text-accent" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-headline font-extrabold text-foreground">
            Sign in to Norruva
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Digital Product Passport Platform
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address-login" className="sr-only">Email address</label>
              <input
                id="email-address-login"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-background"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password-login" className="sr-only">Password</label>
              <input
                id="password-login"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-background"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={authIsLoading || isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {(authIsLoading || isSubmitting) ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Demo credentials: Use any email/password for this prototype.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component (Controller)
const AppController = () => { 
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<'login' | 'dashboard' | 'publicProduct' | 'loading'>('loading');
  const [publicProductId, setPublicProductId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      if (currentPath.startsWith('/product/')) {
        const idFromPath = currentPath.split('/product/')[1];
        if (idFromPath) {
          setPublicProductId(idFromPath);
          setView('publicProduct');
          return; // Prioritize direct product view URL
        }
      }
      
      // Fallback to query param if direct path didn't match
      const productIdFromQuery = searchParams.get('product'); 
      if (productIdFromQuery) {
          setPublicProductId(productIdFromQuery);
          setView('publicProduct');
          return;
      }


      if (!authLoading) { 
        if (user) {
          // Redirect partners to the main dashboard
          if ((user.role === 'manufacturer') && !publicProductId) { 
            router.push('/dashboard'); 
            return; 
          }
          setView('dashboard'); 
        } else {
          setView('login');
        }
      }
    }
  }, [user, authLoading, publicProductId, router]); 

  if (authLoading || view === 'loading') { 
    return <LoadingSpinner />;
  }

  if (view === 'publicProduct' && publicProductId) {
    // This PublicProductViewer is from the original main.tsx and is different from /src/app/product/[productId]/page.tsx
    // To use the one from /src/app/product/[productId]/page.tsx, we should ensure navigation takes the user there directly
    // or this component is refactored to use the logic/components from that page.
    // For now, this internal PublicProductViewer will be used.
    return <PublicProductViewer productId={publicProductId} />;
  }
  
  if (view === 'dashboard') {
    return <Dashboard />;
  }
  
  return <Login />; 
};

export default function NorruvaApp() { 
  return (
    <AuthProvider>
      <AppController />
    </AuthProvider>
  );
}

