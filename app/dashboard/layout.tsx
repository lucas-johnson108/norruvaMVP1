
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Dashboard - Norruva',
  description: 'Manage products, compliance, and tracebility with Norruva.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader /> 
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-secondary"> {/* Changed background to bg-secondary for cleaner canvas */}
          {children}
        </main>
      </div>
    </div>
  );
}
