import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';

import { config } from '@/config';
import LandingPage from '@/routes/pages/LandingPage';
import { ParticipantItem } from '@/types';

import RoomLayout from './layouts/Room';
import ContentSharePhaseView from './pages/ContentShare';
import JoinPhaseView from './pages/Join';
import QnAPhaseView from './pages/QnA';
import StatisticsPhaseView from './pages/Statistics';

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
  return <RouterProvider router={router} />;
}
