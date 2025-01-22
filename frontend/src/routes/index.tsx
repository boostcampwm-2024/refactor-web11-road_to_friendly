import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import LoadingPage from './pages/LoadingPage';

const LandingPage = lazy(() => import('@/routes/pages/LandingPage'));
const RoomLayout = lazy(() => import('@/routes/layouts/Room'));
const JoinPhaseView = lazy(() => import('@/routes/pages/Join'));
const QnAPhaseView = lazy(() => import('@/routes/pages/QnA'));
const StatisticsPhaseView = lazy(() => import('@/routes/pages/Statistics'));
const ContentSharePhaseView = lazy(() => import('@/routes/pages/ContentShare'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/rooms/:roomId',
    element: <RoomLayout />,
    children: [
      {
        path: 'join',
        element: <JoinPhaseView />
      },
      {
        path: 'questions',
        element: <QnAPhaseView />
      },
      {
        path: 'statistics',
        element: <StatisticsPhaseView />
      },
      {
        path: 'content-share',
        element: <ContentSharePhaseView />
      }
    ]
  }
]);

export default function Router() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
