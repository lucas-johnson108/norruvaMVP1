
"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getQRAnalytics, WorldMapComponent, getTrendClass, calculateTrendPercentage, formatDuration, getDeviceColor, getLoadTimeClass, getLoadTimeLabel } from '@/lib/analytics-utils.tsx'; // Updated import extension
import { Loader2, AlertTriangle, Info as InfoIcon } from 'lucide-react'; // Renamed Info to InfoIcon to avoid conflict
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Interface for the data structure (can be refined)
interface ScanDataPoint {
  date: string;
  scans: number;
}
interface CountryDataPoint {
  country: string;
  scans: number;
}
interface DeviceTypeDataPoint {
  name: string;
  value: number;
}
interface ScanMethodDataPoint {
  method: string;
  count: number;
}
interface WorldMapHeatPoint { // Added from utils
  lat: number;
  lng: number;
  value: number;
}
interface Insight {
  title: string;
  description: string;
  recommendation: string;
  severity: 'info' | 'warning' | 'critical';
}
interface AnalyticsData {
  overview: {
    totalScans: number;
    uniqueUsers: number;
    averageEngagement: number;
    topCountries: CountryDataPoint[];
    scanTrend: ScanDataPoint[];
  };
  geographic: {
    topCountries: CountryDataPoint[];
    heatMapData: WorldMapHeatPoint[];
  };
  devices: {
    deviceTypes: DeviceTypeDataPoint[];
    scanMethods: ScanMethodDataPoint[];
  };
  performance: {
    scanSuccessRate: number;
    averageLoadTime: number;
    availabilityUptime: number;
  };
  insights?: Insight[];
}

const QRAnalyticsDashboard = ({ productId }: { productId: string }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getQRAnalytics(productId, timeRange);
        setAnalyticsData(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadAnalytics();
    }
  }, [productId, timeRange]);

  if (loading) return (
    <Card className="p-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
      <p className="text-muted-foreground">Loading analytics...</p>
    </Card>
  );
  if (error) return (
    <Card className="p-6 text-center border-destructive">
      <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
      <p className="text-destructive-foreground">Error loading analytics: {error}</p>
    </Card>
  );
  if (!analyticsData) return (
    <Card className="p-6 text-center">
      <InfoIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">No analytics data available for this product or time range.</p>
    </Card>
  );

  // Utility functions are now imported from analytics-utils.tsx

  return (
    <div className="qr-analytics-dashboard space-y-6"> {/* Main container with custom class name from user */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {/* Overview Cards - using custom classes as per user provided structure */}
      <Card className="shadow-md">
        <CardHeader><CardTitle className="font-headline">Overview</CardTitle></CardHeader>
        <CardContent className="overview-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium text-muted-foreground">Total Scans</h4>
            <div className="value text-2xl font-bold">{analyticsData.overview.totalScans.toLocaleString()}</div>
            <div className={`trend text-xs ${getTrendClass(analyticsData.overview.scanTrend) === 'trend-up' ? 'text-accent' : getTrendClass(analyticsData.overview.scanTrend) === 'trend-down' ? 'text-destructive' : ''}`}>
              {analyticsData.overview.scanTrend.length >= 14 && (
                <span>
                  {calculateTrendPercentage(analyticsData.overview.scanTrend)}% vs prev. 7 days
                </span>
              )}
            </div>
          </div>

          <div className="card p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium text-muted-foreground">Unique Users</h4>
            <div className="value text-2xl font-bold">{analyticsData.overview.uniqueUsers.toLocaleString()}</div>
          </div>

          <div className="card p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium text-muted-foreground">Avg. Engagement</h4>
            <div className="value text-2xl font-bold">{formatDuration(analyticsData.overview.averageEngagement)}</div>
          </div>

          <div className="card p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium text-muted-foreground">Top Country</h4>
            <div className="value text-2xl font-bold">{analyticsData.overview.topCountries[0]?.country || 'N/A'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Scan Trend Chart */}
      <Card className="chart-section shadow-md">
        <CardHeader><CardTitle className="font-headline">Scan Trend ({timeRange === 'all' ? 'All Time' : `Last ${timeRange.replace('d',' Days')}`})</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.overview.scanTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', {month:'short', day:'numeric'})} style={{fontSize: '0.75rem'}}/>
              <YAxis style={{fontSize: '0.75rem'}}/>
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="scans" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{r: 3}}
                activeDot={{r: 5}}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card className="chart-section shadow-md">
        <CardHeader><CardTitle className="font-headline">Geographic Distribution</CardTitle></CardHeader>
        <CardContent className="geo-charts grid md:grid-cols-2 gap-6">
          <div className="chart-container h-[300px]"> {/* Added h-[300px] for consistent height */}
            <h4 className="text-md font-semibold mb-2">Top Countries by Scans</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.geographic.topCountries.slice(0, 5)} layout="vertical" margin={{left: 20, right: 30}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" style={{fontSize: '0.75rem'}}/>
                <YAxis dataKey="country" type="category" width={80} style={{fontSize: '0.75rem'}}/>
                <Tooltip />
                <Bar dataKey="scans" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="world-map h-[300px]"> {/* Added h-[300px] for consistent height */}
            <h4 className="text-md font-semibold mb-2">Global Heat Map (Placeholder)</h4>
            <WorldMapComponent data={analyticsData.geographic.heatMapData} />
          </div>
        </CardContent>
      </Card>
      
      {/* Device Analytics */}
      <Card className="chart-section shadow-md">
        <CardHeader><CardTitle className="font-headline">Device Analytics</CardTitle></CardHeader>
        <CardContent className="device-charts grid md:grid-cols-2 gap-6">
          <div className="chart-container h-[250px]">
            <h4 className="text-md font-semibold mb-2 text-center">Device Types</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.devices.deviceTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.devices.deviceTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getDeviceColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{fontSize: "0.75rem"}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container h-[250px]">
            <h4 className="text-md font-semibold mb-2 text-center">Scan Methods</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.devices.scanMethods}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" style={{fontSize: '0.75rem'}}/>
                <YAxis style={{fontSize: '0.75rem'}}/>
                <Tooltip />
                <Legend wrapperStyle={{fontSize: "0.75rem"}}/>
                <Bar dataKey="count" name="Scans" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="performance-section shadow-md">
        <CardHeader><CardTitle className="font-headline">Performance Metrics</CardTitle></CardHeader>
        <CardContent className="performance-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="metric-card p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium text-muted-foreground">Scan Success Rate</h4>
            <div className="metric-value text-xl font-bold mt-1">
              {(analyticsData.performance.scanSuccessRate * 100).toFixed(1)}%
            </div>
            <div className="progress-bar mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="progress-fill success h-full bg-accent"
                style={{ width: `${analyticsData.performance.scanSuccessRate * 100}%` }}
              />
            </div>
          </div>

          <div className="metric-card p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium text-muted-foreground">Avg. DPP Load Time</h4>
            <div className="metric-value text-xl font-bold mt-1">
              {analyticsData.performance.averageLoadTime}ms
            </div>
            <div className={`text-xs mt-1 ${getLoadTimeClass(analyticsData.performance.averageLoadTime)}`}>
              {getLoadTimeLabel(analyticsData.performance.averageLoadTime)}
            </div>
          </div>

          <div className="metric-card p-4 border rounded-lg bg-card">
            <h4 className="text-sm font-medium text-muted-foreground">System Uptime</h4>
            <div className="metric-value text-xl font-bold mt-1">
              {(analyticsData.performance.availabilityUptime * 100).toFixed(2)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      {analyticsData.insights && analyticsData.insights.length > 0 && (
        <Card className="insights-section shadow-md">
          <CardHeader><CardTitle className="font-headline">Insights & Recommendations</CardTitle></CardHeader>
          <CardContent className="insights-list space-y-4">
            {analyticsData.insights.map((insight, index) => (
              <div key={index} className={`insight-card p-4 border rounded-lg ${insight.severity === 'critical' ? 'border-destructive bg-destructive/10' : insight.severity === 'warning' ? 'border-yellow-500 bg-yellow-500/10' : 'border-primary bg-primary/5'}`}>
                <div className="insight-header flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-foreground">{insight.title}</h4>
                  <span className={`severity-badge text-xs px-2 py-0.5 rounded-full font-medium ${
                    insight.severity === 'critical' ? 'bg-destructive text-destructive-foreground' :
                    insight.severity === 'warning' ? 'bg-yellow-500 text-yellow-foreground' :
                    'bg-primary text-primary-foreground'
                  }`}>{insight.severity.toUpperCase()}</span>
                </div>
                <p className="insight-description text-sm text-muted-foreground">{insight.description}</p>
                <p className="insight-recommendation mt-2 text-sm">
                  <strong className="text-foreground">Recommendation:</strong> {insight.recommendation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRAnalyticsDashboard;
