import { Suspense } from 'react';
import DJDashboard from './dj-dashboard';

export default function DJPage({ params }: { params: { roomId: string } }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <DJDashboard roomId={params.roomId} />
    </Suspense>
  );
}
