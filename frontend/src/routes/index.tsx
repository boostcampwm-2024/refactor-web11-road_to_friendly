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
    // loader: async ({ params }) => {
    //   const { roomId } = params;
    //   const socket = io(config.SOCKET_SERVER_URL);
    //   socket.emit(
    //     'join',
    //     { roomId },
    //     (response: { status: string; body: { participants: ParticipantItem[]; hostId: string } }) => {
    //       const roomExists = response.status === 'ok';
    //       if (roomExists) {
    //         // 참가자 목록에 index 추가
    //         const participantsWithIndex = response.body.participants.map((participant, index) => ({
    //           ...participant,
    //           index
    //         }));

    //         setParticipants(convertArrayToObject(participantsWithIndex));
    //         setHostId(response.body.hostId);
    //         finishInitialLoading();
    //         // navigate(`/rooms/${params.roomId}/join`);
    //       } else {
    //         // TODO: ErrorElement 표시
    //       }
    //       setCurrentUserId(socket?.id || null);
    //     }
    //   );
    //   return {};
    // },
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
