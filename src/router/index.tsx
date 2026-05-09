import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const StoryPage = lazy(() => import('@/pages/StoryPage'));

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>loading…</div>}>
        <Routes>
          <Route path="/" element={<StoryPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
