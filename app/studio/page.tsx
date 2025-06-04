
import FirebaseStudioDashboard from '@/components/studio/firebase-studio-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dev Portal - Norruva',
  description: 'Manage deployments and environments for Norruva.',
};

export default function StudioPage() {
  return <FirebaseStudioDashboard />;
}
