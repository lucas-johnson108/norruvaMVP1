// src/lib/analytics-utils.tsx
"use client";

import React from 'react';

// Mock data structure - adjust as needed to match real API responses
interface ScanDataPoint {
  date: string;
  scans: number;
}

interface CountryDataPoint {
  country: string;
  scans: number;
}

interface DeviceTypeDataPoint {
  name: string; // e.g., 'Mobile', 'Desktop'
  value: number; // count of scans
}

interface ScanMethodDataPoint {
  method: string; // e.g., 'Camera', 'App'
  count: number;
}

interface WorldMapHeatPoint {
  lat: number;
  lng: number;
  value: number; // intensity
}

interface Insight {
  title: string;
  description: string;
  recommendation: string;
  severity: 'info' | 'warning' | 'critical';
}

interface MockAnalyticsData {
  overview: {
    totalScans: number;
    uniqueUsers: number;
    averageEngagement: number; // in seconds
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
    scanSuccessRate: number; // 0.0 to 1.0
    averageLoadTime: number; // in ms
    availabilityUptime: number; // 0.0 to 1.0
  };
  insights?: Insight[];
}

// Mock getQRAnalytics function
export const getQRAnalytics = async (productId: string, timeRange: string): Promise<MockAnalyticsData> => {
  console.log(`Fetching analytics for product ${productId} and time range ${timeRange}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  // Generate more dynamic mock data based on productId or timeRange if needed
  const baseScans = Math.floor(Math.random() * 5000) + 1000;
  const uniqueFactor = 0.3 + Math.random() * 0.4;

  const scanTrendData: ScanDataPoint[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      scans: Math.floor(baseScans / 30 + (Math.random() - 0.5) * (baseScans / 50)),
    };
  });
  
  const topCountriesData: CountryDataPoint[] = [
    { country: 'USA', scans: Math.floor(baseScans * 0.3) },
    { country: 'Germany', scans: Math.floor(baseScans * 0.2) },
    { country: 'France', scans: Math.floor(baseScans * 0.15) },
    { country: 'UK', scans: Math.floor(baseScans * 0.1) },
    { country: 'Canada', scans: Math.floor(baseScans * 0.05) },
  ].sort((a,b) => b.scans - a.scans);

  return {
    overview: {
      totalScans: baseScans,
      uniqueUsers: Math.floor(baseScans * uniqueFactor),
      averageEngagement: Math.floor(Math.random() * 120) + 30, // 30s to 150s
      topCountries: topCountriesData.slice(0,1),
      scanTrend: scanTrendData,
    },
    geographic: {
      topCountries: topCountriesData,
      heatMapData: [ // Placeholder heatmap data
        { lat: 37.7749, lng: -122.4194, value: Math.floor(baseScans * 0.1) }, // San Francisco
        { lat: 40.7128, lng: -74.0060, value: Math.floor(baseScans * 0.08) }, // New York
        { lat: 51.5074, lng: -0.1278, value: Math.floor(baseScans * 0.12) }, // London
        { lat: 48.8566, lng: 2.3522, value: Math.floor(baseScans * 0.07) }, // Paris
        { lat: 35.6895, lng: 139.6917, value: Math.floor(baseScans * 0.05) }, // Tokyo
      ],
    },
    devices: {
      deviceTypes: [
        { name: 'Mobile', value: Math.floor(baseScans * 0.85) },
        { name: 'Desktop', value: Math.floor(baseScans * 0.10) },
        { name: 'Tablet', value: Math.floor(baseScans * 0.04) },
        { name: 'Other', value: Math.floor(baseScans * 0.01) },
      ],
      scanMethods: [
        { method: 'Camera App', count: Math.floor(baseScans * 0.7) },
        { method: 'Brand App', count: Math.floor(baseScans * 0.2) },
        { method: 'Web Scanner', count: Math.floor(baseScans * 0.1) },
      ],
    },
    performance: {
      scanSuccessRate: Math.random() * 0.1 + 0.9, // 90-100%
      averageLoadTime: Math.floor(Math.random() * 1500) + 500, // 500ms - 2000ms
      availabilityUptime: Math.random() * 0.001 + 0.999, // 99.9% - 100%
    },
    insights: Math.random() > 0.5 ? [
      { title: 'High Engagement in USA', description: 'Users from the USA show significantly higher average engagement time with the DPP.', recommendation: 'Consider targeted marketing or additional information for the US market.', severity: 'info' },
      { title: 'Scan Failures Reported', description: 'A small percentage of scan attempts are failing, potentially due to QR code print quality or scanner app compatibility.', recommendation: 'Review QR code printing guidelines and test with various common scanner apps.', severity: 'warning' },
    ] : [],
  };
};

// Placeholder WorldMapComponent
export const WorldMapComponent = ({ data }: { data: WorldMapHeatPoint[] }) => {
  return (
    <div className="w-full h-full bg-muted flex items-center justify-center rounded-md border">
      <p className="text-muted-foreground text-sm">World Map Placeholder (Heatmap Data Count: {data.length})</p>
    </div>
  );
};


// Utility functions from user
export const getTrendClass = (trendData: ScanDataPoint[] | undefined) => {
  if (!trendData || trendData.length < 14) return ''; // Need at least 14 days for 7-day vs previous 7-day
  const recent = trendData.slice(-7);
  const previous = trendData.slice(-14, -7);
  if (recent.length < 7 || previous.length < 7) return '';
  const recentAvg = recent.reduce((sum, d) => sum + d.scans, 0) / recent.length;
  const previousAvg = previous.reduce((sum, d) => sum + d.scans, 0) / previous.length;
  if (previousAvg === 0) return recentAvg > 0 ? 'trend-up' : ''; // Avoid division by zero
  return recentAvg > previousAvg ? 'trend-up' : 'trend-down';
};

export const calculateTrendPercentage = (trendData: ScanDataPoint[] | undefined) => {
  if (!trendData || trendData.length < 14) return 0; // Need at least 14 days
  const recent = trendData.slice(-7);
  const previous = trendData.slice(-14, -7);
   if (recent.length < 7 || previous.length < 7) return 0;
  const recentAvg = recent.reduce((sum, d) => sum + d.scans, 0) / recent.length;
  const previousAvg = previous.reduce((sum, d) => sum + d.scans, 0) / previous.length;
  if (previousAvg === 0) return recentAvg > 0 ? 100 : 0; // Avoid division by zero, represent as 100% increase if previous was 0 and current is >0
  return parseFloat(((recentAvg - previousAvg) / previousAvg * 100).toFixed(1));
};

export const formatDuration = (seconds: number | undefined) => {
  if (seconds === undefined || seconds === null) return 'N/A';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export const getDeviceColor = (deviceType: string) => {
  const colors = {
    mobile: 'hsl(var(--chart-1))', // Blue
    desktop: 'hsl(var(--chart-2))', // Green
    tablet: 'hsl(var(--chart-3))', // Yellow/Orange
    other: 'hsl(var(--chart-4))' // Grey/Purple
  };
  return colors[deviceType.toLowerCase() as keyof typeof colors] || colors.other;
};

export const getLoadTimeClass = (loadTime: number | undefined) => {
  if (loadTime === undefined || loadTime === null) return 'text-muted-foreground'; // Default class
  if (loadTime < 1000) return 'text-accent'; // Excellent
  if (loadTime < 2000) return 'text-yellow-500'; // Good
  if (loadTime < 3000) return 'text-orange-500'; // Fair
  return 'text-destructive'; // Poor
};

export const getLoadTimeLabel = (loadTime: number | undefined) => {
  if (loadTime === undefined || loadTime === null) return 'N/A';
  if (loadTime < 1000) return 'Excellent';
  if (loadTime < 2000) return 'Good';
  if (loadTime < 3000) return 'Fair';
  return 'Needs Improvement';
};

// CSS classes referenced by the component, to be defined by user if they want the exact styling:
// .qr-analytics-dashboard
// .overview-cards .card (h4, .value, .trend, .trend-up, .trend-down)
// .chart-section (h3)
// .geo-charts .chart-container (h4), .world-map (h4)
// .device-charts .chart-container (h4)
// .performance-section (h3), .performance-grid, .metric-card (h4, .metric-value, .progress-bar, .progress-fill.success)
// .insights-section (h3), .insights-list, .insight-card (based on severity: .info, .warning, .critical), .insight-header, .severity-badge, .insight-description, .insight-recommendation
// Note: These classes imply a custom stylesheet. ShadCN/Tailwind alternatives would be used for a theme-consistent look.
