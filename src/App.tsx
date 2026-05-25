import { lazy, Suspense } from 'react';
import LoadingState from '@/components/LoadingState';

const StoryPage = lazy(() => import('@/pages/StoryPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingState />}>
      <StoryPage />
    </Suspense>
  );
}
