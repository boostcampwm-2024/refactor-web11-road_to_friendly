import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import HostView from '@/routes/components/join/HostView';
import ParticipantView from '@/routes/components/join/ParticipantView';
import { useParticipantsStore, useSocketStore } from '@/stores';

const JoinPhaseView = () => {
  const hostId = useParticipantsStore((state) => state.hostId);
  const participants = useParticipantsStore((state) => state.participants);
  const socket = useSocketStore((state) => state.socket);
  const numOfParticipants = Object.keys(participants).length;
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    socket.on('host:start:ack', (response: { status: string; message: string }) => {
      if (response.status === 'ready') {
        navigate(`/rooms/${params.roomId}/questions`);
      }
    });

    return () => {
      socket.off('host:start:ack');
    };
  }, []);

  return hostId === socket.id ? <HostView participantCount={numOfParticipants} /> : <ParticipantView />;
};

export default JoinPhaseView;
