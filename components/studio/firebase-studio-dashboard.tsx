
"use client";
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import {
  Database,
  Settings,
  Users,
  Activity,
  Shield,
  BarChart3,
  Code as CodeIcon,
  Webhook,
  RefreshCw,
  CheckCircle,
  Download,
  Layers,
  Briefcase,
  Server,
  Gauge,
  AlertTriangle,
  Info,
  Rocket,
  Terminal,
  Timer,
  AlertCircle,
  Zap,
  PieChart as PieChartIcon,
  History,
  ExternalLink,
  FileText,
  UserPlus,
  Lock,
  Bell,
  DollarSign,
  BookOpen,
  Filter,
  Search,
  Trash2,
  CreditCard,
  BellRing,
  Wrench,
  MoreHorizontal,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  Percent,
  BookMarked,
  FlaskConical,
  BookCopy,
  Copy,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Send as SendIcon,
  Clock,
  UserCircle as UserCircleIcon,
  LogOut,
  ListChecks,
  Loader2,
  ServerCog,
  Cloud,
  Palette,
  KeyRound,
  Settings2,
  Undo2,
  Globe // Added Globe icon
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell as RechartsCell } from 'recharts';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import { studioConfig, type EnvironmentConfig, type FirebaseStudioConfig } from '@/lib/firebase-definitions';


type Environment = 'development' | 'staging' | 'production';

const FirebaseStudioDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastDeploymentTime, setLastDeploymentTime] = useState<string | null>(null);
  const [currentEnv, setCurrentEnv] = useState<Environment>('development');

  useEffect(() => {
    setLastDeploymentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);


  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'functions', label: 'Functions', icon: CodeIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'integrations', label: 'Integrations', icon: Webhook },
    { id: 'api_docs', label: 'API Docs', icon: BookCopy },
    { id: 'guides', label: 'Guides & Examples', icon: BookMarked },
    { id: 'sandbox', label: 'Sandbox', icon: FlaskConical },
    { id: 'settings', label: 'Platform Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab currentEnv={currentEnv} />;
      case 'database': return <DatabaseTab currentEnv={currentEnv} />;
      case 'functions': return <FunctionsTab currentEnv={currentEnv} />;
      case 'security': return <SecurityTab currentEnv={currentEnv} />;
      case 'users': return <UsersTab currentEnv={currentEnv} />;
      case 'analytics': return <AnalyticsTab currentEnv={currentEnv} />;
      case 'integrations': return <IntegrationsTab currentEnv={currentEnv} />;
      case 'api_docs': return <ApiDocsTab currentEnv={currentEnv} />;
      case 'guides': return <GuidesTab currentEnv={currentEnv} />;
      case 'sandbox': return <SandboxTab currentEnv={currentEnv} />;
      case 'settings': return <SettingsTab currentEnv={currentEnv} config={studioConfig} />;
      default: return <OverviewTab currentEnv={currentEnv} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl font-headline font-bold text-primary flex items-center">
                  <Layers className="mr-2" /> Dev Portal
                </div>
              </div>
              <div className="ml-6">
                <EnvironmentSelector currentEnv={currentEnv} setCurrentEnv={setCurrentEnv} />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DeploymentStatus lastDeploymentTime={lastDeploymentTime} setLastDeploymentTime={setLastDeploymentTime} currentEnv={currentEnv} />
              <UserMenu setActiveDevPortalTab={setActiveTab} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto pb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap focus-visible:ring-0 focus-visible:ring-offset-0",
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

interface EnvironmentSelectorProps {
  currentEnv: Environment;
  setCurrentEnv: (env: Environment) => void;
}

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({ currentEnv, setCurrentEnv }) => {
  const environments = [
    { id: 'development', name: 'Development', colorClass: 'bg-accent' },
    { id: 'staging', name: 'Staging', colorClass: 'bg-yellow-500' },
    { id: 'production', name: 'Production', colorClass: 'bg-destructive' }
  ];

  const selectedEnv = environments.find(env => env.id === currentEnv) || environments[0];

  return (
    <div className="relative">
      <select
        value={currentEnv}
        onChange={(e) => setCurrentEnv(e.target.value as Environment)}
        className="appearance-none bg-card border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
      >
        {environments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
      <div className={cn("absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full", selectedEnv.colorClass)} />
    </div>
  );
};

interface DeploymentStatusProps {
  lastDeploymentTime: string | null;
  setLastDeploymentTime: (time: string | null) => void;
  currentEnv: Environment;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ lastDeploymentTime, setLastDeploymentTime, currentEnv }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [showProductionConfirmDialog, setShowProductionConfirmDialog] = useState(false);
  const { toast } = useToast();

  const executeActualDeployment = () => {
    setIsDeploying(true);
    toast({
      title: `Deployment Started (${currentEnv})`,
      description: `Deploying to the ${currentEnv} environment...`,
    });
    setTimeout(() => {
      setIsDeploying(false);
      const newDeploymentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastDeploymentTime(newDeploymentTime);
      toast({
        title: `Deployment Successful (${currentEnv})`,
        description: `Successfully deployed to ${currentEnv} at ${newDeploymentTime}. (Mock)`,
        variant: 'default',
      });
    }, 3000);
  };

  const handleDeploy = () => {
    if (currentEnv === 'production') {
      setShowProductionConfirmDialog(true);
    } else {
      executeActualDeployment();
    }
  };

  const handleConfirmProductionDeploy = () => {
    setShowProductionConfirmDialog(false);
    executeActualDeployment();
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {isDeploying ? (
          <div className="flex items-center text-yellow-500 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 shadow-sm">
            <RefreshCw className="animate-spin mr-2 h-4 w-4" />
            <span className="text-xs font-medium">Deploying to <span className="font-semibold capitalize">{currentEnv}</span>...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 shadow-sm">
            <CheckCircle className="h-4 w-4 text-accent shrink-0" />
            <p className="text-xs font-medium text-accent-foreground">
              <span className="hidden sm:inline">Deployed:</span> {lastDeploymentTime || 'N/A'}
              <span className="font-semibold capitalize text-accent ml-1">({currentEnv})</span>
            </p>
          </div>
        )}
        <Button
          size="sm"
          onClick={handleDeploy}
          disabled={isDeploying}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isDeploying ? (<><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Deploying...</>) : <><Rocket className="mr-2 h-4 w-4" />Deploy {currentEnv}</>}
        </Button>
      </div>

      <AlertDialog open={showProductionConfirmDialog} onOpenChange={setShowProductionConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive h-6 w-6" /> Confirm Production Deployment
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to deploy to the <strong className="text-destructive font-semibold">PRODUCTION</strong> environment.
              This action can impact live users. Please ensure all changes are thoroughly tested and approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowProductionConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmProductionDeploy}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Confirm & Deploy to Production
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface UserMenuProps {
  setActiveDevPortalTab: (tabId: string) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ setActiveDevPortalTab }) => {
  const mockUser = {
    name: "Dev Portal Admin",
    email: "dev-admin@norruva.com",
    role: "Platform Administrator",
    avatarUrl: "https://placehold.co/32x32/FFBF00/FFFFFF.png?text=DA",
  };

  const handleSignOut = () => {
    alert("Sign Out clicked (Placeholder for Dev Portal Admin)");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Image
            className="h-8 w-8 rounded-full border"
            src={mockUser.avatarUrl}
            alt={mockUser.name}
            width={32}
            height={32}
            data-ai-hint="user avatar"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{mockUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {mockUser.email}
            </p>
             <p className="text-xs leading-none text-muted-foreground capitalize pt-0.5">
              {mockUser.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setActiveDevPortalTab('settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Admin Preferences (Dev Portal)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setActiveDevPortalTab('settings')}>
          <ServerCog className="mr-2 h-4 w-4" />
          <span>Platform Environment Settings</span>
        </DropdownMenuItem>
         <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <UserCircleIcon className="mr-2 h-4 w-4" />
            <span>View App Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface TabProps {
  currentEnv: Environment;
}

const getEnvMultiplier = (env: Environment): number => {
  if (env === 'production') return 10;
  if (env === 'staging') return 3;
  return 1;
};


const OverviewTab: React.FC<TabProps> = ({ currentEnv }) => {
  const multiplier = getEnvMultiplier(currentEnv);
  const keyMetrics = [
    { name: 'Active Cloud Functions', value: (15 * multiplier).toString(), icon: Server, change: `+${2 * multiplier} Today`, changeType: 'increase' as const },
    { name: 'API Calls (24h)', value: `${(1.2 * multiplier).toFixed(1)}M`, icon: Activity, change: '+5.3%', changeType: 'increase' as const },
    { name: 'Firestore Reads (24h)', value: `${(5.5 * multiplier).toFixed(1)}M`, icon: Database, change: '+8.1%', changeType: 'increase' as const },
    { name: 'Avg. API Response', value: `${Math.max(50, 115 - (multiplier * 5))}ms`, icon: Timer, change: `-${multiplier*2}ms`, changeType: 'decrease' as const }
  ];

  const performanceMetrics = [
    { name: 'Function Error Rate (24h)', value: `${Math.max(0.01, 0.03 / multiplier).toFixed(2)}%`, icon: AlertCircle, trend: `-${(0.02 / multiplier).toFixed(2)}%`, trendType: 'decrease' as const, description: "vs previous 24h", target: "< 0.1%" },
    { name: `P95 Latency (api-${currentEnv})`, value: `${Math.max(100, 280 - (multiplier * 10))}ms`, icon: Gauge, trend: `+${Math.max(1, 15/multiplier).toFixed(0)}ms`, trendType: 'increase' as const, description: "Target: <250ms", target: "< 250ms"  },
    { name: `P99 Latency (image-proc-${currentEnv})`, value: `${Math.max(300, 850 - (multiplier * 20))}ms`, icon: Gauge, trend: `-${Math.max(5, 50/multiplier).toFixed(0)}ms`, trendType: 'decrease' as const, description: "Target: <1000ms", target: "< 1s"},
    { name: 'Cache Hit Rate (CDN)', value: `${Math.min(99, 92.5 + multiplier).toFixed(1)}%`, icon: Percent, trend: `+${(1.2 * multiplier / 5).toFixed(1)}%`, trendType: 'increase' as const, description: "Target: >90%", target: "> 90%"},
  ];

  const resourceUtilization = [
    { name: 'Firestore Storage', current: 78 * multiplier, total: 200 * multiplier, unit: 'GB', icon: Database, displayValue: `${(78 * multiplier).toFixed(0)}GB / ${(200*multiplier).toFixed(0)}GB` },
    { name: 'Function Invocations (Month)', current: 1350000 * multiplier, total: 2000000 * multiplier, unit: 'invocations', icon: Zap, displayValue: `${(1.35 * multiplier).toFixed(2)}M / ${(2*multiplier).toFixed(0)}M` },
    { name: 'Storage Transfer (Out)', current: 25 * multiplier, total: 100 * multiplier, unit: 'GB', icon: Layers, displayValue: `${(25*multiplier).toFixed(0)}GB / ${(100*multiplier).toFixed(0)}GB` }
  ];

  const getInitialAlerts = (env: Environment) => [
    { id: 'alert1', message: `High Firestore read latency in 'products-${env}' collection.`, severity: (env === 'production' ? 'high' : 'medium') as 'high' | 'medium' | 'low', time: '5m ago', link: '#', acknowledged: false },
    { id: 'alert2', message: `image-processor-${env} function timeout rate > ${env === 'production' ? '0.5' : '1'}%.`, severity: (env === 'production' ? 'high' : 'medium') as 'high' | 'medium' | 'low', time: '45m ago', link: '#', acknowledged: false },
    { id: 'alert3', message: `Billing alert: Approaching 80% of ${env} budget.`, severity: 'low' as 'high' | 'medium' | 'low', time: '3h ago', link: '#', acknowledged: env !== 'production' },
  ];
  const [activeAlerts, setActiveAlerts] = useState(getInitialAlerts(currentEnv));

  useEffect(() => {
    setActiveAlerts(getInitialAlerts(currentEnv));
  }, [currentEnv]);


  const getRecentActivity = (env: Environment) => [
    { action: `Deployment of notifications-v2 to ${env} SUCCEEDED.`, time: '8 minutes ago', status: 'success' as const, icon: Rocket },
    { action: `${env} environment database restored from backup.`, time: '1 hour ago', status: 'info' as const, icon: Download },
    { action: `Security scan completed on ${env}: 0 critical vulnerabilities found.`, time: '2 hours ago', status: 'success' as const, icon: Shield },
    { action: `product-recommendation-${env} function scaled up automatically.`, time: '4 hours ago', status: 'info' as const, icon: Zap },
  ];
  const recentActivity = getRecentActivity(currentEnv);


  const getStatusBadge = (status: 'success' | 'warning' | 'info' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-accent text-accent-foreground"><CheckCircle className="mr-1 h-3 w-3" /> Success</Badge>;
      case 'warning':
        return <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-500/90 text-white"><AlertTriangle className="mr-1 h-3 w-3" /> Warning</Badge>;
      case 'info':
        return <Badge variant="secondary"><Info className="mr-1 h-3 w-3" /> Info</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-500/90 text-white text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{severity}</Badge>;
    }
  };

  const getSeverityBorderClass = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-border';
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setActiveAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };


  return (
    <div className="space-y-8">
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyMetrics.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className={cn("text-xs", stat.changeType === 'increase' ? 'text-accent' : 'text-destructive')}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-primary" /> Performance Snapshot
            </CardTitle>
             <CardDescription>Key performance indicators for your platform services in <span className="font-semibold capitalize">{currentEnv}</span>.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {performanceMetrics.map(metric => {
                const Icon = metric.icon;
                const TrendIcon = metric.trendType === 'increase' ? TrendingUp : TrendingDown;
                return (
                    <div key={metric.name} className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center text-muted-foreground mb-1.5">
                            <Icon className="h-4 w-4 mr-2" />
                            <span className="text-xs font-medium ">{metric.name}</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                        <div className="flex items-center text-xs mt-1">
                             <TrendIcon className={cn("h-3 w-3 mr-1", metric.trendType === 'increase' ? (metric.name.toLowerCase().includes('latency') || metric.name.toLowerCase().includes('error rate') ? 'text-destructive' : 'text-accent') : (metric.name.toLowerCase().includes('latency') || metric.name.toLowerCase().includes('error rate') ? 'text-accent' : 'text-destructive'))} />
                             <span className={cn("font-medium", metric.trendType === 'increase' ? (metric.name.toLowerCase().includes('latency') || metric.name.toLowerCase().includes('error rate') ? 'text-destructive' : 'text-accent') : (metric.name.toLowerCase().includes('latency') || metric.name.toLowerCase().includes('error rate') ? 'text-accent' : 'text-destructive'))}>
                                {metric.trend}
                             </span>
                             <span className="ml-1 text-muted-foreground">{metric.description}</span>
                        </div>
                        {metric.target && <p className="text-xs text-primary/70 mt-0.5">Target: {metric.target}</p>}
                    </div>
                );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-md border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Active Alerts ({activeAlerts.filter(a => !a.acknowledged).length})
            </CardTitle>
             <CardDescription className="text-destructive/80">Critical issues requiring attention for <span className="font-semibold capitalize">{currentEnv}</span>.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-60 overflow-y-auto">
            {activeAlerts.length > 0 ? activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 border-l-4 rounded-r-md bg-background shadow-sm hover:shadow-md transition-shadow",
                  getSeverityBorderClass(alert.severity),
                  alert.acknowledged && "opacity-60"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  {getSeverityBadge(alert.severity)}
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
                <p className="text-sm text-foreground">{alert.message}</p>
                <div className="mt-2 flex items-center justify-between">
                    <Button variant="link" size="xs" asChild className="p-0 h-auto text-primary">
                    <Link href={alert.link}>View Details <ExternalLink className="h-3 w-3 ml-1"/></Link>
                    </Button>
                    {!alert.acknowledged && (
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="px-2 py-1 h-auto text-xs"
                    >
                        Acknowledge
                    </Button>
                    )}
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No active critical alerts. System nominal.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" /> Resource Utilization
            </CardTitle>
             <CardDescription>Overview of your service quotas and usage for <span className="font-semibold capitalize">{currentEnv}</span>.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-1">
            {resourceUtilization.map(resource => {
              const Icon = resource.icon;
              const percentage = resource.total > 0 ? (resource.current / resource.total) * 100 : 0;
              return (
                <div key={resource.name}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 mr-2" />
                        {resource.name}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                        {resource.displayValue || `${resource.current.toLocaleString()} / ${resource.total.toLocaleString()} ${resource.unit}`}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Recent Activity
            </CardTitle>
             <CardDescription>Latest platform events and logs for <span className="font-semibold capitalize">{currentEnv}</span>.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            <Table>
              <TableBody>
                {recentActivity.map((activity, index) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <TableRow key={index} className="hover:bg-muted/30">
                      <TableCell className="py-3">
                        <div className="flex items-center">
                          <ActivityIcon className="h-4 w-4 mr-3 text-primary/70 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground leading-tight">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-3 pr-4">{getStatusBadge(activity.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthOverview currentEnv={currentEnv} />
        <QuickActionsOverview currentEnv={currentEnv} />
      </div>
    </div>
  );
};


const SystemHealthOverview: React.FC<TabProps> = ({ currentEnv }) => {
  const services = [
    { name: `Firebase Functions (${currentEnv})`, status: 'healthy', uptime: '99.99%', icon: Server },
    { name: `Firestore Database (${currentEnv})`, status: 'healthy', uptime: '100%', icon: Database },
    { name: `Authentication (${currentEnv})`, status: 'healthy', uptime: '99.98%', icon: Users },
    { name: `API Gateway (${currentEnv})`, status: currentEnv === 'production' ? 'healthy' : 'issues_detected', uptime: '99.85%', icon: Gauge }
  ];

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'issues_detected': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> System Health
        </CardTitle>
        <CardDescription>Current status of core platform services for <span className="font-semibold capitalize">{currentEnv}</span>.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center">
              <service.icon className="h-5 w-5 mr-3 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium text-foreground">{service.name}</span>
                <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
              </div>
            </div>
            {getStatusIndicator(service.status)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const QuickActionsOverview: React.FC<TabProps> = ({ currentEnv }) => {
  const actions = [
    { name: `View ${currentEnv} Logs`, icon: Terminal, action: () => alert(`View ${currentEnv} Deployment Logs clicked`) },
    { name: `Manage API Keys`, icon: KeyRound, action: () => alert('Manage API Keys clicked (placeholder)') },
    { name: `Manage Env. Variables`, icon: Settings2, action: () => alert(`Manage Environment Variables for ${currentEnv} clicked`) },
    { name: `View Billing Details`, icon: DollarSign, action: () => alert(`View Billing for ${currentEnv} clicked`) },
    { name: `Trigger ${currentEnv} Backup`, icon: Download, action: () => alert(`Trigger ${currentEnv} Backup clicked`) },
    { name: `Rollback ${currentEnv}`, icon: Undo2, action: () => alert(`Rollback ${currentEnv} clicked (Placeholder)`), disabled: currentEnv === 'production' },
  ];
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary"/> Quick Actions
        </CardTitle>
        <CardDescription>Perform common operational tasks for <span className="font-semibold capitalize">{currentEnv}</span>.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.name}
              variant="outline"
              onClick={action.action}
              disabled={action.disabled}
              className="flex flex-col items-center justify-center p-3 h-auto aspect-square text-center hover:bg-accent/10 hover:border-accent focus-visible:ring-accent"
              title={action.disabled ? `${action.name} (Disabled for ${currentEnv})` : action.name}
            >
              <Icon className="h-6 w-6 text-primary mb-1.5" />
              <span className="text-xs font-medium text-foreground leading-tight">{action.name}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const DatabaseTab: React.FC<TabProps> = ({ currentEnv }) => {
  const multiplier = getEnvMultiplier(currentEnv);
  const [selectedCollection, setSelectedCollection] = useState(`products-${currentEnv}`);
  const collections = [
    { name: `companies-${currentEnv}`, count: 1234 * multiplier, size: `${(45.2 * multiplier).toFixed(1)} MB`, avgDocSize: '36.6 KB', indexes: 3 },
    { name: `products-${currentEnv}`, count: 12345 * multiplier, size: `${(234.5 * multiplier).toFixed(1)} MB`, avgDocSize: '19.0 KB', indexes: 5 },
    { name: `users-${currentEnv}`, count: 456 * multiplier, size: `${(12.3 * multiplier).toFixed(1)} MB`, avgDocSize: '26.9 KB', indexes: 2 },
    { name: `verifications-${currentEnv}`, count: 2345 * multiplier, size: `${(67.8*multiplier).toFixed(1)} MB`, avgDocSize: '28.9 KB', indexes: 4 },
    { name: `analytics_events-${currentEnv}`, count: 567890 * multiplier, size: `${(1.2*multiplier).toFixed(1)} GB`, avgDocSize: '2.1 KB', indexes: 2 },
  ];

  const usageData = [
    { name: 'Jan', reads: 4000*multiplier, writes: 2400*multiplier, deletes: 200*multiplier },
    { name: 'Feb', reads: 3000*multiplier, writes: 1398*multiplier, deletes: 150*multiplier },
    { name: 'Mar', reads: 2000*multiplier, writes: 9800*multiplier, deletes: 500*multiplier },
    { name: 'Apr', reads: 2780*multiplier, writes: 3908*multiplier, deletes: 300*multiplier },
    { name: 'May', reads: 1890*multiplier, writes: 4800*multiplier, deletes: 250*multiplier },
    { name: 'Jun', reads: 2390*multiplier, writes: 3800*multiplier, deletes: 180*multiplier },
  ];

  const backupStatus = { lastBackup: `2024-07-23 02:00 AM (${currentEnv})`, status: 'Success', nextBackup: `2024-07-24 02:00 AM (${currentEnv})` };

  useEffect(() => {
    setSelectedCollection(`products-${currentEnv}`);
  }, [currentEnv]);

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Database className="h-6 w-6 text-primary"/>Firestore Database Management ({currentEnv.toUpperCase()})</CardTitle>
          <CardDescription>Monitor collections, analyze usage, and manage database operations for the <span className="font-semibold capitalize">{currentEnv}</span> environment.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5"/>Collections Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collection</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Total Size</TableHead>
                  <TableHead>Avg. Doc Size</TableHead>
                  <TableHead>Indexes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map(col => (
                  <TableRow key={col.name} className="hover:bg-muted/50">
                    <TableCell><Button variant="link" className="p-0 h-auto" onClick={() => setSelectedCollection(col.name)}>{col.name}</Button></TableCell>
                    <TableCell>{col.count.toLocaleString()}</TableCell>
                    <TableCell>{col.size}</TableCell>
                    <TableCell>{col.avgDocSize}</TableCell>
                    <TableCell>{col.indexes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5"/>Real-time Usage (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10}/>
                <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}}/>
                <Legend wrapperStyle={{fontSize: '10px'}}/>
                <Line type="monotone" dataKey="reads" name="Reads" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{r:2}}/>
                <Line type="monotone" dataKey="writes" name="Writes" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{r:2}}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5"/>Storage & Quotas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label>Total Firestore Storage ({currentEnv})</Label>
                <Progress value={(78.5 * multiplier) / (200 * multiplier) * 100} className="h-3 mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{(78.5 * multiplier).toFixed(1)} GB / {(200 * multiplier).toFixed(0)} GB ({( (78.5*multiplier) / (200*multiplier) * 100).toFixed(0)}%)</p>
            </div>
             <div>
                <Label>Document Count ({currentEnv})</Label>
                <Progress value={(600000 * multiplier) / (1000000 * multiplier) * 100} className="h-3 mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{(600000 * multiplier).toLocaleString()} / {(1000000*multiplier).toLocaleString()} Documents ({( (600000*multiplier) / (1000000*multiplier) * 100).toFixed(0)}%)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Download className="h-5 w-5"/>Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">Last Backup: <span className="font-semibold">{backupStatus.lastBackup}</span> <Badge className={backupStatus.status === 'Success' ? "bg-accent text-accent-foreground" : "bg-destructive"}>{backupStatus.status}</Badge></p>
            <p className="text-sm">Next Scheduled: <span className="font-semibold">{backupStatus.nextBackup}</span></p>
            <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">Trigger Manual Backup</Button>
                <Button variant="outline" size="sm">View Restore Options</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5"/>Collection Details: {selectedCollection}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed document browser, query tools, and schema viewer for the '{selectedCollection}' collection would appear here. (Placeholder for {currentEnv})</p>
          <Button variant="link" className="p-0 h-auto mt-2">Manage Indexes for {selectedCollection}</Button>
        </CardContent>
      </Card>
    </div>
  );
};

const FunctionsTab: React.FC<TabProps> = ({ currentEnv }) => {
  const multiplier = getEnvMultiplier(currentEnv);
  const functionsList = [
    { name: `api-v1-products-get-${currentEnv}`, region: 'europe-west1', runtime: 'Nodejs 18', memory: '256MB', timeout: '60s', trigger: 'HTTPS', lastDeployed: '2h ago', status: 'OK', invocations: 12345 * multiplier, errors: currentEnv === 'production' ? Math.floor(2/multiplier) : 2 * multiplier, duration: `${120 - multiplier*5}ms` },
    { name: `process-dpp-upload-${currentEnv}`, region: 'europe-west1', runtime: 'Nodejs 18', memory: '512MB', timeout: '300s', trigger: 'Storage', lastDeployed: '1d ago', status: 'OK', invocations: 567 * multiplier, errors: 0, duration: `${2500 - multiplier*100}ms` },
    { name: `send-compliance-alert-${currentEnv}`, region: 'us-central1', runtime: 'Nodejs 18', memory: '128MB', timeout: '60s', trigger: 'Pub/Sub', lastDeployed: '5h ago', status: currentEnv === 'development' ? 'Error' : 'OK', invocations: 89 * multiplier, errors: currentEnv === 'development' ? 12 * multiplier : Math.floor(12/multiplier), duration: `${85 - multiplier*3}ms` },
    { name: `scheduled-eprel-sync-${currentEnv}`, region: 'europe-west1', runtime: 'Nodejs 18', memory: '256MB', timeout: '540s', trigger: 'Schedule', lastDeployed: '3d ago', status: 'OK', invocations: 24 * multiplier, errors: 0, duration: `${150 - multiplier*10}s` },
  ];

  const performanceData = [
    { name: '00:00', invocations: 400*multiplier, errors: 2*multiplier }, { name: '04:00', invocations: 300*multiplier, errors: 1*multiplier },
    { name: '08:00', invocations: 600*multiplier, errors: 5*multiplier }, { name: '12:00', invocations: 800*multiplier, errors: 3*multiplier },
    { name: '16:00', invocations: 700*multiplier, errors: 2*multiplier }, { name: '20:00', invocations: 900*multiplier, errors: 4*multiplier },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Server className="h-6 w-6 text-primary"/>Cloud Functions ({currentEnv.toUpperCase()})</CardTitle>
          <CardDescription>Monitor, manage, and deploy your backend functions for the <span className="font-semibold capitalize">{currentEnv}</span> environment.</CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90">Deploy New Function</Button>
            <Button variant="outline">View All Logs</Button>
        </CardFooter>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5"/>Overall Performance (Last 24 hours)</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis yAxisId="left" fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" fontSize={10}/>
                    <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}}/>
                    <Legend wrapperStyle={{fontSize: '10px'}}/>
                    <Line yAxisId="left" type="monotone" dataKey="invocations" name="Invocations" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{r:2}}/>
                    <Line yAxisId="right" type="monotone" dataKey="errors" name="Errors" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{r:2}}/>
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5"/>Deployed Functions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Invocations (24h)</TableHead>
                        <TableHead>Errors (24h)</TableHead>
                        <TableHead>Avg. Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {functionsList.map(fn => (
                        <TableRow key={fn.name} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{fn.name}</TableCell>
                            <TableCell>
                                <Badge className={cn(fn.status === 'OK' ? 'bg-accent text-accent-foreground' : 'bg-destructive')}>
                                    {fn.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{fn.region}</TableCell>
                            <TableCell>{fn.trigger}</TableCell>
                            <TableCell>{fn.invocations.toLocaleString()}</TableCell>
                            <TableCell className={cn(fn.errors > 0 && "text-destructive font-semibold")}>{fn.errors}</TableCell>
                            <TableCell>{fn.duration}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="link" size="xs" className="p-0 h-auto mr-2">Logs</Button>
                                <Button variant="link" size="xs" className="p-0 h-auto">Config</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const SecurityTab: React.FC<TabProps> = ({ currentEnv }) => {
  const multiplier = getEnvMultiplier(currentEnv);
  const rulesStatus = [
    { name: `Firestore Rules (${currentEnv})`, lastUpdated: '2024-07-22 10:00 UTC', status: 'Active & Secure', filePath: `firestore.${currentEnv}.rules`},
    { name: `Storage Rules (${currentEnv})`, lastUpdated: '2024-07-20 15:30 UTC', status: 'Active & Secure', filePath: `storage.${currentEnv}.rules`},
  ];
  const authOverview = { totalUsers: 1256 * multiplier, activeLast24h: 342 * multiplier, methods: [{name: 'Email/Pass', count: 800*multiplier}, {name: 'Google', count: 400*multiplier}, {name: `DID (EBSI-${currentEnv})`, count: 56*multiplier}] };
  const recentSecurityEvents = [
    { event: `Unusual sign-in attempt blocked for user X on ${currentEnv}.`, severity: currentEnv === 'production' ? 'Medium' : 'Info', time: '1h ago'},
    { event: `App Check enforcement enabled for API Gateway (${currentEnv}).`, severity: 'Info', time: '3h ago'},
    { event: `Firestore rule updated for products-${currentEnv} collection.`, severity: 'Info', time: '1d ago'},
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/>Security Center ({currentEnv.toUpperCase()})</CardTitle>
            <CardDescription>Monitor and manage your platform's security configurations for the <span className="font-semibold capitalize">{currentEnv}</span> environment.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5"/>Security Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rulesStatus.map(rule => (
              <div key={rule.name} className="p-3 border rounded-md bg-muted/30">
                <div className="flex justify-between items-center">
                    <span className="font-medium">{rule.name}</span>
                    <Badge className={rule.status === "Active & Secure" ? "bg-accent text-accent-foreground" : "bg-destructive"}>{rule.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Last Updated: {rule.lastUpdated} ({rule.filePath})</p>
                <Button variant="link" size="sm" className="p-0 h-auto mt-1">Edit Rules</Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5"/>Authentication Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{authOverview.totalUsers.toLocaleString()} <span className="text-sm text-muted-foreground">Total Users</span></p>
            <p className="text-lg">{authOverview.activeLast24h} <span className="text-sm text-muted-foreground">Active (24h)</span></p>
            <div className="mt-4 h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={authOverview.methods} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={60} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                             {authOverview.methods.map((entry, index) => (
                                <RechartsCell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}}/>
                        <Legend wrapperStyle={{fontSize: '10px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><BellRing className="h-5 w-5"/>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Severity</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
                <TableBody>
                    {recentSecurityEvents.map((event, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/50">
                            <TableCell>{event.event}</TableCell>
                            <TableCell>
                                <Badge variant={event.severity === 'Info' ? 'secondary' : event.severity === 'Medium' ? 'outline' : 'destructive'}
                                className={event.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-700' : ''}>
                                    {event.severity}
                                </Badge>
                            </TableCell>
                            <TableCell>{event.time}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
        <CardFooter className="pt-4">
            <Button variant="outline" size="sm">View All Security Logs</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const UsersTab: React.FC<TabProps> = ({ currentEnv }) => {
  const multiplier = getEnvMultiplier(currentEnv);
  const userStats = { total: 1256 * multiplier, newLast7Days: 45 * multiplier, activeDAU: 342 * multiplier, activeMAU: 890 * multiplier };
  const usersList = [
    { id: 'user1', email: `alice@example-${currentEnv}.com`, name: `Alice (${currentEnv})`, provider: 'Email', created: '2024-01-15', lastSignIn: '2024-07-23', role: 'Admin' },
    { id: 'user2', email: `bob@example-${currentEnv}.com`, name: `Bob (${currentEnv})`, provider: 'Google', created: '2024-02-20', lastSignIn: '2024-07-22', role: 'Manufacturer' },
    { id: 'user3', email: `charlie@ebsi-${currentEnv}.eu`, name: `Charlie (${currentEnv})`, provider: `DID (EBSI-${currentEnv})`, created: '2024-05-10', lastSignIn: '2024-07-20', role: 'Verifier' },
  ];
  const activityData = [
    { date: 'Jul 17', newUsers: 5*multiplier, activeUsers: 300*multiplier }, { date: 'Jul 18', newUsers: 7*multiplier, activeUsers: 310*multiplier },
    { date: 'Jul 19', newUsers: 3*multiplier, activeUsers: 290*multiplier }, { date: 'Jul 20', newUsers: 8*multiplier, activeUsers: 320*multiplier },
    { date: 'Jul 21', newUsers: 6*multiplier, activeUsers: 315*multiplier }, { date: 'Jul 22', newUsers: 4*multiplier, activeUsers: 305*multiplier },
    { date: 'Jul 23', newUsers: 9*multiplier, activeUsers: 340*multiplier },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>User Management ({currentEnv.toUpperCase()})</CardTitle>
            <CardDescription>Oversee platform users, their roles, and activity for the <span className="font-semibold capitalize">{currentEnv}</span> environment.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader><CardTitle className="text-sm font-medium">Total Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{userStats.total.toLocaleString()}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm font-medium">New (7d)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-accent">+{userStats.newLast7Days}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm font-medium">DAU</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{userStats.activeDAU}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm font-medium">MAU</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{userStats.activeMAU}</p></CardContent></Card>
      </div>

      <Card className="shadow-md">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5"/>User Activity (Last 7 Days)</CardTitle></CardHeader>
        <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{top: 5, right: 20, left: -20, bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                    <XAxis dataKey="date" fontSize={10}/>
                    <YAxis yAxisId="left" fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" fontSize={10} />
                    <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}}/>
                    <Legend wrapperStyle={{fontSize: '10px'}}/>
                    <Bar yAxisId="left" dataKey="activeUsers" name="Active Users" fill={CHART_COLORS[0]} radius={[4,4,0,0]}/>
                    <Bar yAxisId="right" dataKey="newUsers" name="New Users" fill={CHART_COLORS[1]} radius={[4,4,0,0]}/>
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5"/>User List</CardTitle>
            <div className="flex gap-2 mt-2">
                <Input placeholder="Search users..." className="max-w-xs"/>
                <Button variant="outline"><Filter className="mr-2 h-4 w-4"/>Filter</Button>
                <Button className="bg-primary hover:bg-primary/90"><UserPlus className="mr-2 h-4 w-4"/>Add User</Button>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Provider</TableHead><TableHead>Role</TableHead><TableHead>Last Sign-In</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {usersList.map(user => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell><Badge variant="outline">{user.provider}</Badge></TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.lastSignIn}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="link" size="xs" className="p-0 h-auto mr-2">Edit</Button>
                                <Button variant="link" size="xs" className="p-0 h-auto text-destructive">Disable</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
        <CardFooter className="pt-4"><Button variant="outline" size="sm">Load More Users</Button></CardFooter>
      </Card>
    </div>
  );
};

const AnalyticsTab: React.FC<TabProps> = ({ currentEnv }) => {
  const multiplier = getEnvMultiplier(currentEnv);
  const eventData = [ { name: 'Page View', value: 12000 * multiplier }, { name: 'DPP Scan', value: 8500 * multiplier }, { name: 'Data Request', value: 3200 * multiplier }, { name: 'Verification Complete', value: 1500 * multiplier }];
  const engagementData = [ { date: 'W1', avgSession: 2.5 * (1 + multiplier/20), retention: 60 - multiplier }, { date: 'W2', avgSession: 2.8 * (1 + multiplier/20), retention: 55 - multiplier }, { date: 'W3', avgSession: 3.1 * (1 + multiplier/20), retention: 58 - multiplier }, { date: 'W4', avgSession: 2.9 * (1 + multiplier/20), retention: 52 - multiplier } ];
  const pageLoadTimes = [ { path: `/product/view-${currentEnv}`, avgLoad: Math.max(0.5, 1.2 - multiplier/20) }, { path: `/dashboard-${currentEnv}`, avgLoad: Math.max(0.8, 2.5 - multiplier/10) }, { path: `/api/products-${currentEnv}`, avgLoad: Math.max(0.2, 0.8 - multiplier/30) } ];

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary"/>Platform Analytics ({currentEnv.toUpperCase()})</CardTitle>
            <CardDescription>Track user engagement, key events, and platform performance for <span className="font-semibold capitalize">{currentEnv}</span>.</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PieChartIcon className="h-5 w-5"/>Key Event Distribution</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={eventData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                             {eventData.map((entry, index) => (
                                <RechartsCell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}}/>
                        <Legend wrapperStyle={{fontSize: '10px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5"/>User Engagement Over Time</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData} margin={{top: 5, right: 20, left: -20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                        <XAxis dataKey="date" fontSize={10}/>
                        <YAxis yAxisId="left" label={{ value: 'Avg Session (min)', angle: -90, position: 'insideLeft', fontSize: 10, offset:-10 }} fontSize={10}/>
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Retention (%)', angle: 90, position: 'insideRight', fontSize: 10, offset:-10 }} fontSize={10} domain={[0,100]}/>
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}}/>
                        <Legend wrapperStyle={{fontSize: '10px'}}/>
                        <Line yAxisId="left" type="monotone" dataKey="avgSession" name="Avg. Session (min)" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{r:2}}/>
                        <Line yAxisId="right" type="monotone" dataKey="retention" name="1-Week Retention %" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{r:2}}/>
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
       <Card className="shadow-md">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Timer className="h-5 w-5"/>Page Load Performance (Avg)</CardTitle></CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader><TableRow><TableHead>Path</TableHead><TableHead>Avg. Load Time (s)</TableHead><TableHead>Views (24h)</TableHead></TableRow></TableHeader>
                <TableBody>
                    {pageLoadTimes.map(page => (
                        <TableRow key={page.path} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-xs">{page.path}</TableCell>
                            <TableCell>{page.avgLoad.toFixed(1)}s</TableCell>
                            <TableCell>{(Math.random()*1000 * multiplier).toFixed(0)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const IntegrationsTab: React.FC<TabProps> = ({ currentEnv }) => {
  const multiplier = getEnvMultiplier(currentEnv);
  const externalApis = [
    { name: `EPREL API (${currentEnv})`, status: 'Connected', callsToday: 1205 * multiplier, errorRate: `${(0.1 / multiplier).toFixed(1)}%`, lastSync: '5m ago', icon: ExternalLink },
    { name: `EBSI DID Resolver (${currentEnv})`, status: 'Connected', callsToday: 340 * multiplier, errorRate: '0.0%', lastSync: '2m ago', icon: Layers },
    { name: `GS1 Global Registry (${currentEnv})`, status: currentEnv === 'development' ? 'Error' : 'Connected', callsToday: 50 * multiplier, errorRate: currentEnv === 'development' ? '5.2%' : `${(0.2/multiplier).toFixed(1)}%`, lastSync: '1h ago', icon: Search },
  ];
  const webhooks = [
    { url: `https://api.mycrm.com/norruva/${currentEnv}`, events: ['product.created', 'verification.completed'], status: 'Active', deliveries: 560 * multiplier, failures: currentEnv === 'production' ? 0 : 2 * multiplier},
    { url: `https://alerts.internal/dpp-${currentEnv}`, events: ['compliance.failed', 'security.alert'], status: 'Inactive', deliveries: 0, failures: 0},
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Webhook className="h-6 w-6 text-primary"/>Integrations Hub ({currentEnv.toUpperCase()})</CardTitle>
            <CardDescription>Manage connections to external services and webhook subscriptions for <span className="font-semibold capitalize">{currentEnv}</span>.</CardDescription>
        </CardHeader>
      </Card>
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><ExternalLink className="h-5 w-5"/>External API Connectors</CardTitle>
            <Button variant="outline" size="sm" className="ml-auto">Add Connector</Button>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalApis.map(api => {
                const ApiIcon = api.icon;
                return (
                    <Card key={api.name} className={cn("border-l-4", api.status === 'Connected' ? "border-accent" : "border-destructive")}>
                        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ApiIcon className="h-4 w-4"/>{api.name}</CardTitle></CardHeader>
                        <CardContent className="text-xs space-y-1">
                            <p>Status: <Badge variant={api.status === 'Connected' ? 'default' : 'destructive'} className={api.status === 'Connected' ? 'bg-accent text-accent-foreground' : ''}>{api.status}</Badge></p>
                            <p>Calls (24h): {api.callsToday.toLocaleString()}</p>
                            <p>Error Rate: {api.errorRate}</p>
                            <p>Last Sync: {api.lastSync}</p>
                            <Button variant="link" size="xs" className="p-0 h-auto mt-1">Configure</Button>
                        </CardContent>
                    </Card>
                );
            })}
        </CardContent>
      </Card>
       <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><BellRing className="h-5 w-5"/>Webhooks</CardTitle>
            <Button variant="outline" size="sm" className="ml-auto">Add Webhook</Button>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader><TableRow><TableHead>URL</TableHead><TableHead>Events</TableHead><TableHead>Status</TableHead><TableHead>Deliveries (24h)</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {webhooks.map(wh => (
                        <TableRow key={wh.url} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-xs truncate max-w-xs">{wh.url}</TableCell>
                            <TableCell className="text-xs">{wh.events.join(', ')}</TableCell>
                            <TableCell><Badge variant={wh.status === 'Active' ? 'default' : 'secondary'} className={wh.status === 'Active' ? 'bg-accent text-accent-foreground' : ''}>{wh.status}</Badge></TableCell>
                            <TableCell>{wh.deliveries} <span className={cn(wh.failures > 0 && "text-destructive")}>({wh.failures} failed)</span></TableCell>
                            <TableCell className="text-right">
                                <Button variant="link" size="xs" className="p-0 h-auto mr-2">Edit</Button>
                                <Button variant="link" size="xs" className="p-0 h-auto text-destructive">Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

interface SettingsTabProps extends TabProps {
  config: FirebaseStudioConfig;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ currentEnv, config }) => {
  const envConfig = config.environments[currentEnv];
  const servicesConfig = config.services;

  const teamMembers = [
    { name: `Admin (${currentEnv})`, role: 'Owner', email: `admin@norruva-${currentEnv}.com`},
    { name: `Dev Team (${currentEnv})`, role: 'Admin', email: `devs@norruva-${currentEnv}.com`}
  ];
  const [notificationSettings, setNotificationSettings] = useState({
    projectAlerts: currentEnv !== 'development',
    billingNotifications: true,
    securityAudits: currentEnv === 'production',
  });

  const handleNotificationChange = (id: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({...prev, [id]: !prev[id]}));
    alert(`Toggled ${id} for ${currentEnv} (Placeholder)`);
  };

  const DetailItem: React.FC<{ label: string; value: string | React.ReactNode; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
    <div className="flex items-start py-1.5">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />}
      <span className="text-sm font-medium text-muted-foreground w-48 shrink-0">{label}:</span>
      <span className="text-sm text-foreground break-words">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Settings className="h-6 w-6 text-primary"/>Platform Environment Settings ({currentEnv.toUpperCase()})</CardTitle>
            <CardDescription>Manage configuration for the <span className="font-semibold capitalize">{currentEnv}</span> platform environment.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Cloud className="h-5 w-5"/>Environment Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-1">
                <DetailItem label="Project ID" value={envConfig.projectId} icon={Briefcase}/>
                <DetailItem label="Default Region" value={envConfig.region} icon={Globe}/>
                <DetailItem label="Firestore Region" value={envConfig.database.firestore.region} icon={Database}/>
                <DetailItem label="Firestore Multi-Region" value={envConfig.database.firestore.multiRegion ? 'Enabled' : 'Disabled'} icon={Layers}/>
                <DetailItem label="Functions Runtime" value={envConfig.functions.runtime} icon={CodeIcon}/>
                <DetailItem label="Functions Memory" value={envConfig.functions.memory} icon={Zap}/>
                <DetailItem label="Hosting Site" value={envConfig.hosting.site} icon={Server}/>
                {envConfig.hosting.customDomain && <DetailItem label="Custom Domain" value={envConfig.hosting.customDomain} icon={Link}/>}
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ServerCog className="h-5 w-5"/>Key Service Settings</CardTitle></CardHeader>
            <CardContent className="space-y-1">
                <DetailItem label="Auth Providers" value={servicesConfig.auth.providers.join(', ')} icon={Users}/>
                <DetailItem label="Firestore Backups" value={servicesConfig.firestore.backups} icon={Download}/>
                <DetailItem label="Function Triggers" value={<Badge variant="secondary" className="text-xs">{servicesConfig.functions.triggers.length} types enabled</Badge>} icon={Zap}/>
                <DetailItem label="Secrets Management" value={servicesConfig.functions.secrets} icon={Lock}/>
                 <DetailItem label="EPREL API Endpoint" value={config.integrations.external.eprel.endpoint.substring(0,25) + "..."} icon={ExternalLink}/>
                <DetailItem label="EBSI API Endpoint" value={config.integrations.external.ebsi.endpoint.substring(0,25) + "..."} icon={ExternalLink}/>
            </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5"/>Billing & Subscription (<span className="font-semibold capitalize">{currentEnv}</span> Project)</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
            <DetailItem label="Current Plan" value={currentEnv === 'production' ? 'Enterprise Tier' : 'Developer Plan'}/>
            <DetailItem label="Billing Cycle" value="Monthly"/>
            <DetailItem label="Next Payment" value="2024-08-01"/>
            <DetailItem label="Amount" value={currentEnv === 'production' ? '€1,999.00' : '€0.00'}/>
            <DetailItem label="Payment Method" value="Visa **** 1234"/>
            <Button variant="outline" size="sm" className="mt-3">Manage Subscription</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5"/>Environment Access Management</CardTitle>
            <Button variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4"/>Invite Team Member</Button>
        </CardHeader>
        <CardContent className="p-0">
             <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {teamMembers.map(member => (
                        <TableRow key={member.email} className="hover:bg-muted/50">
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell><Badge variant={member.role === 'Owner' ? 'default' : 'secondary'} className={member.role === 'Owner' ? 'bg-primary text-primary-foreground' : ''}>{member.role}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="link" size="xs" className="p-0 h-auto mr-2">Edit Role</Button>
                                <Button variant="link" size="xs" className="p-0 h-auto text-destructive">Remove</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

       <Card className="shadow-md">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5"/>Notification Preferences (for Dev Portal Admin)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {[
                    {id: 'projectAlerts', label: 'Project Alerts', desc: `Critical errors, quota warnings for ${currentEnv}.`},
                    {id: 'billingNotifications', label: 'Billing Notifications', desc: `Invoices, payment issues for ${currentEnv} project.`},
                    {id: 'securityAudits', label: `Weekly Security Digest (${currentEnv})`, desc: `Summary of security events for ${currentEnv}.`}
                ].map(item => (
                     <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div>
                            <Label htmlFor={`${item.id}-${currentEnv}`} className="font-medium">{item.label}</Label>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                            id={`${item.id}-${currentEnv}`}
                            checked={(notificationSettings as any)[item.id]}
                            onCheckedChange={() => handleNotificationChange(item.id as keyof typeof notificationSettings)}
                        />
                    </div>
                ))}
                <Button className="mt-2 bg-primary hover:bg-primary/90">Save Notification Settings</Button>
            </CardContent>
        </Card>

         <Card className="shadow-md border-destructive/40 bg-destructive/5">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5"/>Danger Zone ({currentEnv.toUpperCase()})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="p-3 border border-destructive/60 rounded-md">
                    <h4 className="font-semibold text-destructive">Export All Project Data</h4>
                    <p className="text-xs text-destructive/80 mb-2">This will generate a full export of all data for the <span className="font-bold capitalize">{currentEnv}</span> environment. This can take some time.</p>
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" size="sm">Request Data Export</Button>
                </div>
                <div className="p-3 border border-destructive/60 rounded-md">
                    <h4 className="font-semibold text-destructive">Delete Project Environment</h4>
                    <p className="text-xs text-destructive/80 mb-2">Permanently delete the <span className="font-bold capitalize">{currentEnv}</span> environment and all its data. This action cannot be undone.</p>
                    <Button variant="destructive" size="sm" disabled={currentEnv === 'production'}>Delete {currentEnv} Environment</Button>
                    {currentEnv === 'production' && <p className="text-xs text-destructive/80 mt-1">Project deletion is disabled for production environment via UI for safety.</p>}
                </div>
            </CardContent>
        </Card>
    </div>
  );
};


const ApiDocsTab: React.FC<TabProps> = ({ currentEnv }) => {
  const serverUrls = {
    development: 'https://dev-api.norruva.com/v1',
    staging: 'https://staging-api.norruva.com/v1',
    production: 'https://api.norruva.com/v1',
  };

  // Memoize apiSpec to prevent unnecessary re-renders of SwaggerUI
  // if the spec object reference changes without actual content change.
  const apiSpec = React.useMemo(() => ({
    openapi: '3.0.0',
    info: {
      title: `Norruva API (${currentEnv.toUpperCase()})`,
      version: '1.0.0',
      description: `API for managing Digital Product Passports and related data on the Norruva platform. Current environment: ${currentEnv}.`,
    },
    servers: [
      { url: serverUrls[currentEnv], description: `${currentEnv.charAt(0).toUpperCase() + currentEnv.slice(1)} server` }
    ],
    tags: [
      { name: 'Products', description: 'Product and DPP management' },
      { name: 'Compliance', description: 'Compliance checking and reporting' },
    ],
    paths: {
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List all products',
          description: 'Retrieves a list of products, potentially filtered by query parameters.',
          parameters: [
            { name: 'limit', in: 'query', description: 'Maximum number of products to return', required: false, schema: { type: 'integer', format: 'int32', default: 20 } },
            { name: 'category', in: 'query', description: 'Filter by product category', required: false, schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'A list of products.',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } },
            },
          },
        },
        post: {
          tags: ['Products'],
          summary: 'Create a new product',
          description: 'Adds a new product to the system.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/NewProduct' } } } },
          responses: {
            '201': { description: 'Product created successfully.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            '400': { description: 'Invalid input' },
          },
        },
      },
      '/products/{productId}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID',
          description: 'Retrieves a specific product by its unique ID.',
          parameters: [ { name: 'productId', in: 'path', description: 'ID of the product to retrieve', required: true, schema: { type: 'string' } } ],
          responses: {
            '200': { description: 'Successful operation', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            '404': { description: 'Product not found' },
          },
        },
      },
      '/compliance/check': {
        post: {
          tags: ['Compliance'],
          summary: 'Perform a compliance check',
          description: 'Analyzes product data against specified compliance standards.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ComplianceCheckInput' } } }
          },
          responses: {
            '200': { description: 'Compliance check report.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ComplianceCheckOutput' } } } },
            '400': { description: 'Invalid input for compliance check' }
          }
        }
      }
    },
    components: {
      schemas: {
        Product: { type: 'object', properties: { id: { type: 'string', example: 'prod_abc123' }, name: { type: 'string', example: 'EcoSmart LED Bulb' }, gtin: { type: 'string', example: '01234567890123' }, category: { type: 'string', example: 'Electronics' }, status: { type: 'string', enum: ['draft', 'active', 'archived'], example: 'active' }}},
        NewProduct: { type: 'object', required: ['name', 'gtin', 'category'], properties: { name: { type: 'string', example: 'EcoPro Solar Panel' }, gtin: { type: 'string', example: '09876543210987' }, category: { type: 'string', example: 'Energy' }, description: { type: 'string', nullable: true, example: 'High-efficiency monocrystalline solar panel.' }}},
        ComplianceCheckInput: { type: 'object', properties: { productData: { type: 'object', description: 'JSON object of the product data.' }, complianceStandards: { type: 'string', description: 'Text content of compliance standards and directives.'}}},
        ComplianceCheckOutput: { type: 'object', properties: { overallStatus: { type: 'string', enum: ['Compliant', 'Non-Compliant', 'Partially Compliant', 'Error'] }, summary: { type: 'string' }, detailedChecks: { type: 'array', items: { type: 'object', properties: { standard: { type: 'string' }, status: { type: 'string' }, findings: { type: 'string' }, evidence: { type: 'array', items: {type: 'string'}}, recommendations: {type: 'string', nullable: true} }}}}}
      },
      securitySchemes: { ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-KEY' }}
    },
    security: [ { ApiKeyAuth: [] } ]
  }), [currentEnv, serverUrls]); // This ensures apiSpec is stable if currentEnv/serverUrls haven't changed.

  // Key prop ensures SwaggerUI remounts if spec fundamentally changes (e.g. due to currentEnv)
  const swaggerKey = `swagger-ui-${currentEnv}`;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><BookCopy className="h-6 w-6 text-primary"/>API Documentation ({currentEnv.toUpperCase()})</CardTitle>
        <CardDescription>Comprehensive API reference for the <span className="font-semibold capitalize">{currentEnv}</span> environment.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="swagger-ui-container" style={{ minHeight: '600px' }}>
          {/* The `key` prop helps React re-render SwaggerUI when the environment (and thus spec) changes */}
          <SwaggerUI key={swaggerKey} spec={apiSpec} />
        </div>
      </CardContent>
    </Card>
  );
};

type Language = 'javascript' | 'python' | 'curl' | 'php';
type ExampleKey = 'create-product' | 'verify-product' | 'generate-qr' | 'compliance-check';

const codeSnippets: Record<ExampleKey, Partial<Record<Language, string>>> = {
  'create-product': {
    javascript: `
const response = await fetch('/api/v1/products', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Norruva Washing Machine',
    category: 'electronics_large',
    gtin: '05012345678901',
    sustainability: { /* ... */ }
  })
});
const product = await response.json();
console.log('Product created:', product.id);
    `,
    python: `
import requests
url = "https://api.norruva.com/v1/products"
headers = { /* ... */ }
data = { /* ... */ }
response = requests.post(url, headers=headers, json=data)
print(response.json())
    `,
    curl: `
curl -X POST https://api.norruva.com/v1/products \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Norruva Washing Machine", ... }'
    `
  },
  'verify-product': {
    javascript: `
const verification = await fetch(\`/api/v1/products/\${productId}/verify\`, {
  method: 'POST', /* ... */
});
const result = await verification.json();
console.log('Verification ID:', result.verificationId);
    `
  },
   'generate-qr': {
    javascript: `
const response = await fetch(\`/api/v1/products/\${productId}/qrcode\`, {
  method: 'POST', /* ... */
});
const qrData = await response.json();
console.log('QR Code URL:', qrData.qrCodeUrl);
    `
  },
  'compliance-check': {
     javascript: `
const response = await fetch('/api/v1/compliance/check', {
  method: 'POST', /* ... */
});
const complianceReport = await response.json();
console.log('Report ID:', complianceReport.reportId);
    `
  }
};


const CodeExamples: React.FC<{ currentEnv: Environment }> = ({ currentEnv }) => {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [selectedExample, setSelectedExample] = useState<ExampleKey>('create-product');

  const handleCopyToClipboard = () => {
    const codeToCopy = (codeSnippets[selectedExample]?.[selectedLanguage] || '').replace(/https:\/\/api\.norruva\.com/g, serverUrls[currentEnv]);
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy.trim())
        .then(() => toast({ title: "Code Copied!", description: `${selectedLanguage.toUpperCase()} code for ${selectedExample} copied to clipboard.` }))
        .catch(err => toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy code." }));
    }
  };

  const serverUrls = {
    development: 'https://dev-api.norruva.com/v1',
    staging: 'https://staging-api.norruva.com/v1',
    production: 'https://api.norruva.com/v1',
  };

  const availableExamples: { value: ExampleKey; label: string }[] = [
    { value: 'create-product', label: 'Create Product DPP' },
    { value: 'verify-product', label: 'Submit for Verification' },
    { value: 'generate-qr', label: 'Generate QR Code' },
    { value: 'compliance-check', label: 'Run AI Compliance Check' },
  ];

  const availableLanguages: { value: Language; label: string }[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'curl', label: 'cURL' },
    { value: 'php', label: 'PHP (Placeholder)' },
  ];

  const currentCode = (codeSnippets[selectedExample]?.[selectedLanguage] || `// Code example for ${selectedExample} in ${selectedLanguage} (env: ${currentEnv}) coming soon...`).replace(/https:\/\/api\.norruva\.com/g, serverUrls[currentEnv]).replace(/YOUR_API_KEY/g, `YOUR_${currentEnv.toUpperCase()}_API_KEY`);

  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="font-headline">Code Snippets</CardTitle>
        <CardDescription>
          Quick start code snippets for common API operations in the <span className="font-semibold capitalize">{currentEnv}</span> environment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="example-select-snippets">Select Example:</Label>
          <Select value={selectedExample} onValueChange={(value) => setSelectedExample(value as ExampleKey)}>
            <SelectTrigger id="example-select-snippets" className="mt-1">
              <SelectValue placeholder="Choose an API example" />
            </SelectTrigger>
            <SelectContent>
              {availableExamples.map(ex => (
                <SelectItem key={ex.value} value={ex.value}>{ex.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            {availableLanguages.map(lang => (
              <TabsTrigger key={lang.value} value={lang.value} disabled={!codeSnippets[selectedExample]?.[lang.value] && lang.value === 'php'}>
                {lang.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4 relative">
            <ScrollArea className="h-72 w-full rounded-md border">
              <pre className="bg-muted p-4 text-xs">
                <code className={`language-${selectedLanguage}`}>{currentCode.trim()}</code>
              </pre>
            </ScrollArea>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyToClipboard}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground h-7 w-7"
              title="Copy code"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface GuideStep {
  title: string;
  content: string;
  code?: string;
}

interface Guide {
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: GuideStep[];
}

const guides: Record<string, Guide> = {
  'quick-start': {
    title: '15-Minute Quick Start',
    description: 'Get up and running with the Norruva API in 15 minutes.',
    estimatedTime: '15 mins',
    difficulty: 'Beginner',
    steps: [
      { title: '1. Obtain Your API Key', content: `<p>To start using the API, you need an API key for authentication. Follow these steps:</p><ol class="list-decimal list-inside space-y-1 mt-2"><li>Sign up for a developer account on the Norruva platform if you haven't already.</li><li>Navigate to the <strong>Dashboard &rarr; API Keys</strong> section.</li><li>Generate a new API key. Choose appropriate permissions for your project (e.g., read-only or read/write for products).</li><li><strong>Important:</strong> Copy the generated API key and store it securely. You will not be able to see it again.</li></ol><p class="mt-2 text-xs text-muted-foreground">Treat your API key like a password. Do not embed it directly in client-side code or commit it to version control.</p>`, code: `// Store your API key securely, e.g., in an environment variable\nconst API_KEY = process.env.NORRUVA_API_KEY;\n// Use the correct base URL for your environment (Dev, Staging, Prod)\nconst BASE_URL = 'https://api.norruva.com/v1'; // Example for Development`},
      { title: '2. Install SDK (Optional)', content: '<p>While you can make direct HTTP requests, our SDKs can simplify integration (SDK availability is illustrative for this demo).</p>', code: `// JavaScript/TypeScript SDK (Illustrative)\nnpm install @norruva/sdk\n\n# Python SDK (Illustrative)\npip install norruva-sdk`},
      { title: '3. Make Your First API Call (List Products)', content: '<p>Let\'s try fetching a list of products. This is usually a GET request.</p>', code: `// JavaScript Example (using Fetch API)\nasync function listProducts() {\n  const response = await fetch(\`\${BASE_URL}/products?limit=5\`, {\n    method: 'GET',\n    headers: {\n      'Authorization': \`Bearer \${API_KEY}\`,\n      'Content-Type': 'application/json'\n    }\n  });\n  if (!response.ok) {\n    throw new Error(\`API Error: \${response.status}\`);\n  }\n  const data = await response.json();\n  console.log('First 5 products:', data.products);\n  return data;\n}\nlistProducts().catch(console.error);`},
      { title: '4. Create a Test Product DPP', content: '<p>Now, let\'s create a basic Digital Product Passport for a test product using a POST request.</p>', code: `// JavaScript Example (using Fetch API)\nasync function createTestProduct() {\n  const productData = {\n    name: 'My Test Product (Sandbox)',\n    gtin: '01234567890123',\n    category: 'electronics',\n    description: 'A sample product created via API for testing.',\n    publicData: {\n      basicInfo: {\n        brand: 'Sandbox Brand',\n        model: 'TestModel-001',\n        manufacturingDate: new Date().toISOString(),\n        countryOfOrigin: 'XX'\n      }\n    }\n  };\n  const response = await fetch(\`\${BASE_URL}/products\`, {\n    method: 'POST',\n    headers: {\n      'Authorization': \`Bearer \${API_KEY}\`,\n      'Content-Type': 'application/json'\n    },\n    body: JSON.stringify(productData)\n  });\n  if (!response.ok) {\n    const errorData = await response.json().catch(() => ({ message: response.statusText }));\n    throw new Error(\`API Error: \${response.status} - \${errorData.message || 'Unknown error'}\`);\n  }\n  const newProduct = await response.json();\n  console.log('New product created:', newProduct);\n  return newProduct;\n}\ncreateTestProduct().catch(console.error);`},
      { title: '5. Generate a QR Code (Conceptual)', content: '<p>DPPs are often accessed via QR codes. This step outlines how you might request QR code generation for your product. The actual QR code generation might be a separate endpoint or an attribute of the product resource.</p>', code: `// JavaScript Example (Conceptual - API endpoint may vary)\nasync function getProductQRCode(productId) {\n  const response = await fetch(\`\${BASE_URL}/products/\${productId}/qrcode\`, {\n    method: 'GET', // Or POST if it generates on demand\n    headers: { 'Authorization': \`Bearer \${API_KEY}\` }\n  });\n  if (!response.ok) throw new Error('Failed to get QR code');\n  const qrData = await response.json(); // e.g., { qrImageUrl: '...', digitalLink: '...' }\n  console.log('QR Code data:', qrData);\n  return qrData;\n}\n// Assuming 'newProduct.id' from previous step\n// getProductQRCode('YOUR_PRODUCT_ID').catch(console.error);`},
    ]
  },
  'shopify-integration': { title: 'Shopify Integration', description: 'Connect your Shopify store.', estimatedTime: '30 mins', difficulty: 'Intermediate', steps: [{ title: 'Step 1: Install App', content: 'Install from Shopify App Store.'}] },
  'eprel-integration': { title: 'EPREL Integration', description: 'Sync with EPREL database.', estimatedTime: '1 hr', difficulty: 'Advanced', steps: [{ title: 'Step 1: Configure EPREL API Key', content: 'Obtain and configure your EPREL API key in platform settings.'}] },
  'webhook-config': { title: 'Webhook Configuration', description: 'Set up webhooks for real-time events.', estimatedTime: '20 mins', difficulty: 'Intermediate', steps: [{ title: 'Step 1: Create Endpoint', content: 'Create an HTTPS endpoint on your server to receive webhook payloads.'}] },
  'security-guide': { title: 'Security Best Practices', description: 'Guidelines for secure API usage.', estimatedTime: '25 mins', difficulty: 'Intermediate', steps: [{ title: 'Rule 1: Secure API Keys', content: 'Always store API keys securely. Never expose them in client-side code.'}] },
};

const StepComponent: React.FC<{ step: GuideStep; onNext: () => void; onPrev: () => void; isFirst: boolean; isLast: boolean; currentEnv: Environment; guideKey: string; }> = ({ step, onNext, onPrev, isFirst, isLast, currentEnv, guideKey }) => {
  const { toast } = useToast();
  const serverUrls = {
    development: 'https://dev-api.norruva.com/v1',
    staging: 'https://staging-api.norruva.com/v1',
    production: 'https://api.norruva.com/v1',
  };
  const codeToDisplay = step.code ? step.code.replace(/https:\/\/api\.norruva\.com\/v1/g, serverUrls[currentEnv]).replace(/YOUR_API_KEY/g, `YOUR_${currentEnv.toUpperCase()}_API_KEY`) : '';


  const copyCode = () => {
    if (codeToDisplay) {
      navigator.clipboard.writeText(codeToDisplay.trim())
        .then(() => toast({ title: "Code Copied!", description: "Step code copied to clipboard." }))
        .catch(err => toast({ variant: "destructive", title: "Copy Failed" }));
    }
  };
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary font-headline">{step.title}</h3>
      <div className="text-sm prose prose-sm max-w-none prose-headings:font-headline prose-headings:text-primary" dangerouslySetInnerHTML={{ __html: step.content }} />
      {codeToDisplay && (
        <div className="relative mt-4">
           <ScrollArea className="h-60 w-full rounded-md border">
            <pre className="bg-muted p-4 text-xs">
              <code>{codeToDisplay.trim()}</code>
            </pre>
          </ScrollArea>
          <Button variant="ghost" size="icon" onClick={copyCode} className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground" title="Copy code"><Copy className="h-4 w-4"/></Button>
        </div>
      )}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onPrev} disabled={isFirst}><ChevronLeft className="mr-2"/> Previous Step</Button>
        <Button onClick={onNext} disabled={isLast} className="bg-primary hover:bg-primary/90">Next Step <ChevronRight className="ml-2"/></Button>
      </div>
    </div>
  );
};

const IntegrationGuides: React.FC<{currentEnv: Environment}> = ({currentEnv}) => {
  const [selectedGuideKey, setSelectedGuideKey] = useState<string>('quick-start');
  const [currentStep, setCurrentStep] = useState(1);

  const selectedGuide = guides[selectedGuideKey];

  useEffect(() => {
    setCurrentStep(1);
  }, [selectedGuideKey]);

  const guideCategories = {
    "Getting Started": ['quick-start'],
    "Platform Integrations": ['shopify-integration'],
    "Compliance Workflows": ['eprel-integration'],
    "Advanced Features": ['webhook-config'],
    "Best Practices": ['security-guide']
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <ScrollArea className="h-[calc(100vh-250px)] md:w-1/3 lg:w-1/4">
        <aside className="space-y-4 pr-4">
          {Object.entries(guideCategories).map(([categoryName, guideKeys]) => (
            <div key={categoryName}>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-2 px-2">{categoryName}</h3>
              {guideKeys.map(key => {
                 const guide = guides[key];
                 if (!guide) return null;
                 return (
                    <Card
                        key={key}
                        className={cn("mb-2 cursor-pointer hover:shadow-md transition-shadow", selectedGuideKey === key ? "border-primary ring-1 ring-primary" : "border-border")}
                        onClick={() => setSelectedGuideKey(key)}
                    >
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm font-medium">{guide.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                            <p className="truncate">{guide.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Badge variant="outline" className="text-xs"><Clock className="mr-1 h-3 w-3"/>{guide.estimatedTime}</Badge>
                                <Badge variant="outline" className="text-xs"><BarChart3 className="mr-1 h-3 w-3"/>{guide.difficulty}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                 );
              })}
            </div>
          ))}
        </aside>
      </ScrollArea>
      <main className="flex-1">
        {selectedGuide ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">{selectedGuide.title}</CardTitle>
              <CardDescription>{selectedGuide.description}</CardDescription>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span><Clock className="inline mr-1 h-3 w-3"/> {selectedGuide.estimatedTime}</span>
                <span><BarChart3 className="inline mr-1 h-3 w-3"/> {selectedGuide.difficulty}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Step {currentStep} of {selectedGuide.steps.length}</span>
                <Progress value={(currentStep / selectedGuide.steps.length) * 100} className="w-1/2 h-1.5"/>
              </div>
              {selectedGuide.steps[currentStep - 1] && (
                <StepComponent
                  step={selectedGuide.steps[currentStep - 1]}
                  onNext={() => setCurrentStep(s => Math.min(s + 1, selectedGuide.steps.length))}
                  onPrev={() => setCurrentStep(s => Math.max(s - 1, 1))}
                  isFirst={currentStep === 1}
                  isLast={currentStep === selectedGuide.steps.length}
                  currentEnv={currentEnv}
                  guideKey={selectedGuideKey}
                />
              )}
            </CardContent>
          </Card>
        ) : <p>Select a guide to start.</p>}
      </main>
    </div>
  );
};


const GuidesTab: React.FC<TabProps> = ({ currentEnv }) => {
  return (
    <Tabs defaultValue="code-snippets" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="code-snippets">Code Snippets</TabsTrigger>
        <TabsTrigger value="step-by-step-guides">Step-by-Step Guides</TabsTrigger>
      </TabsList>
      <TabsContent value="code-snippets">
        <CodeExamples currentEnv={currentEnv} />
      </TabsContent>
      <TabsContent value="step-by-step-guides">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><ListChecks className="h-6 w-6 text-primary"/>Integration Guides ({currentEnv.toUpperCase()})</CardTitle>
            <CardDescription>Step-by-step tutorials for integrating with the Norruva platform in the <span className="font-semibold capitalize">{currentEnv}</span> environment.</CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationGuides currentEnv={currentEnv}/>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

const serverUrls = {
  development: 'https://dev-api.norruva.com/v1',
  staging: 'https://staging-api.norruva.com/v1',
  production: 'https://api.norruva.com/v1',
};

const TestingSandbox: React.FC<{currentEnv: Environment}> = ({currentEnv}) => {
  const [endpoint, setEndpoint] = useState('/products');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState(`{\n  "Authorization": "Bearer YOUR_${currentEnv.toUpperCase()}_API_KEY",\n  "Content-Type": "application/json"\n}`);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const baseApiUrl = serverUrls[currentEnv];

  useEffect(() => {
    setHeaders(`{\n  "Authorization": "Bearer YOUR_${currentEnv.toUpperCase()}_API_KEY",\n  "Content-Type": "application/json"\n}`);
  }, [currentEnv]);

  const makeRequest = async () => {
    setLoading(true);
    setResponse('');
    try {
      let parsedHeaders;
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        throw new Error("Invalid JSON in Headers.");
      }

      let parsedBody;
      if (method !== 'GET' && body) {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          throw new Error("Invalid JSON in Request Body.");
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      let mockStatus = 200;
      let mockData: any = { message: `Mock response from ${method} ${baseApiUrl}${endpoint}` };

      if (endpoint.startsWith('/products')) {
        if (method === 'GET') {
          if (endpoint === '/products' || endpoint.startsWith('/products?')) {
            mockData = { products: [{id: `mock-${currentEnv}-prod-1`, name: `Product ${currentEnv} 1`}, {id: `mock-${currentEnv}-prod-2`, name: `Product ${currentEnv} 2`}], total: 2, page: 1, limit: endpoint.includes('limit=') ? parseInt(endpoint.split('limit=')[1].split('&')[0]) : 10 };
          } else if (endpoint.match(/^\/products\/[^/]+$/)) {
            const prodId = endpoint.split('/')[2];
            mockData = { id: prodId, name: `Fetched ${prodId} (${currentEnv})`, category: 'electronics', lastUpdated: new Date().toISOString() };
          } else {
            mockStatus = 404; mockData = { error: "Product endpoint not found" };
          }
        } else if (method === 'POST' && endpoint === '/products') {
          if (!parsedBody || !parsedBody.name || !parsedBody.category || !parsedBody.gtin) {
            mockStatus = 400;
            mockData = { error: "Bad Request: Missing required fields (name, category, gtin) for product creation." };
          } else {
            mockStatus = 201;
            mockData = { id: `new-mock-${currentEnv}-prod-${Date.now().toString().slice(-5)}`, ...parsedBody, message: "Product created (mock)" , createdAt: new Date().toISOString() };
          }
        } else if (method === 'PUT' && endpoint.match(/^\/products\/[^/]+$/)) {
            const prodId = endpoint.split('/')[2];
            if (!parsedBody) {
                 mockStatus = 400; mockData = { error: "Bad Request: Missing request body for update." };
            } else {
                mockStatus = 200;
                mockData = { id: prodId, ...parsedBody, message: `Product ${prodId} updated (mock)`, updatedAt: new Date().toISOString() };
            }
        } else if (method === 'DELETE' && endpoint.match(/^\/products\/[^/]+$/)) {
            const prodId = endpoint.split('/')[2];
            mockStatus = 204;
            mockData = "";
        }


      } else if (endpoint.startsWith('/compliance/check') && method === 'POST') {
          if (!parsedBody || !parsedBody.productData || !parsedBody.complianceStandards) {
            mockStatus = 400;
            mockData = { error: "Bad Request: Missing 'productData' or 'complianceStandards' for compliance check." };
          } else {
            mockStatus = 200;
            mockData = {
                reportId: `comp-rep-${currentEnv}-${Date.now().toString().slice(-5)}`,
                overallStatus: "Partially Compliant",
                summary: "The product meets most requirements but requires attention to packaging recyclability information.",
                detailedChecks: [
                    { standard: "CE Marking", status: "Compliant", findings: "CE mark present, DoC available.", evidence: ["productData.compliance.CE_DoC_ID"], recommendations: null},
                    { standard: "RoHS Directive", status: "Compliant", findings: "All substances within limits.", evidence: ["productData.materials.hazardousSubstances.lead"], recommendations: null},
                    { standard: "Packaging Waste Directive", status: "Requires Attention", findings: "Recycling symbols unclear for mixed materials.", evidence: ["productData.packaging.symbols"], recommendations: "Clarify symbols or use mono-material packaging."},
                ],
                checkedAt: new Date().toISOString()
            };
          }
      }

      else {
        mockStatus = 404;
        mockData = { error: "Sandbox endpoint not recognized or not mocked yet."};
      }

      setResponse(JSON.stringify({ status: mockStatus, headers: {"Content-Type": "application/json", "X-Sandbox-Env": currentEnv, "X-Request-ID": `mock-req-${Date.now()}`}, body: mockData }, null, 2));
      toast({title: "Request Sent (Mock)", description: `${method} ${baseApiUrl}${endpoint} - Status: ${mockStatus}`});

    } catch (error: any) {
      setResponse(JSON.stringify({ error: error.message, details: error.stack }, null, 2));
      toast({variant: "destructive", title: "Request Error", description: error.message});
    }
    setLoading(false);
  };

  const populateExample = (exampleType: string) => {
    const examples: Record<string, {method: string, endpoint: string, body: string}> = {
      'create-product': { method: 'POST', endpoint: '/products', body: JSON.stringify({ name: `Test Product (${currentEnv})`, category: 'electronics', gtin: '1234567890123', description: 'A sandbox product' }, null, 2) },
      'get-products': { method: 'GET', endpoint: '/products?limit=2', body: '' },
      'get-product-by-id': { method: 'GET', endpoint: `/products/prod-sample-${currentEnv}`, body: '' },
      'compliance-check': { method: 'POST', endpoint: '/compliance/check', body: JSON.stringify({ productData: { name: `Compliance Test Product (${currentEnv})`, /* ... more product data */ }, complianceStandards: "CE Marking, RoHS Directive" }, null, 2) },
    };
    const example = examples[exampleType];
    if (example) {
      setMethod(example.method);
      setEndpoint(example.endpoint);
      setBody(example.body);
      setResponse('');
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2"><PlayCircle className="h-6 w-6 text-primary"/>API Testing Sandbox</CardTitle>
        <CardDescription>
          Safely test API endpoints for the <span className="font-semibold capitalize">{currentEnv}</span> environment.
          Current API Base: <code className="text-xs bg-muted p-1 rounded">{baseApiUrl}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 border-b pb-4 mb-4">
          <Button variant="outline" size="sm" onClick={() => populateExample('get-products')}>GET /products</Button>
          <Button variant="outline" size="sm" onClick={() => populateExample('get-product-by-id')}>GET /products/:id</Button>
          <Button variant="outline" size="sm" onClick={() => populateExample('create-product')}>POST /products</Button>
          <Button variant="outline" size="sm" onClick={() => populateExample('compliance-check')}>POST /compliance/check</Button>
        </div>

        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 sm:col-span-2">
            <Label htmlFor="sandbox-method">Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="sandbox-method"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-12 sm:col-span-7">
            <Label htmlFor="sandbox-endpoint">Endpoint Path (e.g., /products)</Label>
            <Input id="sandbox-endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="/products" />
          </div>
          <div className="col-span-12 sm:col-span-3">
            <Button onClick={makeRequest} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendIcon className="mr-2 h-4 w-4"/>}
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="request-details">
            <AccordionTrigger>Request Details (Headers & Body)</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label htmlFor="sandbox-headers">Headers (JSON)</Label>
                <Textarea id="sandbox-headers" value={headers} onChange={(e) => setHeaders(e.target.value)} rows={4} className="font-mono text-xs"/>
              </div>
              {(method === 'POST' || method === 'PUT') && (
                <div>
                  <Label htmlFor="sandbox-body">Request Body (JSON)</Label>
                  <Textarea id="sandbox-body" value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Enter JSON request body..." className="font-mono text-xs"/>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div>
          <Label htmlFor="sandbox-response">Response</Label>
          <ScrollArea className="h-72 w-full rounded-md border mt-1">
            <pre id="sandbox-response" className="bg-muted p-4 text-xs whitespace-pre-wrap break-all">
                {response || 'Response will appear here...'}
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
            Note: This is a simulated sandbox. No actual API calls are made to external servers for this demo.
            API key in headers is illustrative for the selected environment.
        </p>
      </CardFooter>
    </Card>
  );
};

const SandboxTab: React.FC<TabProps> = ({ currentEnv }) => {
  return (
    <TestingSandbox currentEnv={currentEnv} />
  );
};


export default FirebaseStudioDashboard;
