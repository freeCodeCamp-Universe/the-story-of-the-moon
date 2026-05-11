import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoadingState from '@/components/LoadingState';

const StoryPage = lazy(() => import('@/pages/StoryPage'));

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route path="/" element={<StoryPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
