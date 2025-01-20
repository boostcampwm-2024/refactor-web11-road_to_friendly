import { css } from '@emotion/react';
import { useEffect, useMemo } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import useParticipants from '@/hooks/useParticipants';

import { roomError } from '@/constants/roomError';
import { useCheckRoomAccess, useLoadingState } from '@/hooks';
import UserProfile from '@/routes/components/room/UserProfile';
import RoomCatchWrapper from '@/routes/layouts/RoomCatchWrapper';
import LoadingPage from '@/routes/pages/LoadingPage';
import { useRadiusStore } from '@/stores/';
import { Variables } from '@/styles/variables';
import { calculatePosition, calculateRadius } from '@/utils';

import { ShareButton } from '../components';
import { Header } from '../components/common';
import ParticipantListSidebar from '../components/room/ParticipantListSidebar';

const RoomLayout = () => {
  const { showBoundary } = useErrorBoundary();
  const roomId = useParams<{ roomId: string }>().roomId || null;
  const { initialLoading, finishInitialLoading } = useLoadingState();
  const navigate = useNavigate();
  const params = useParams();

  const { participants, hostId, currentUserId, roomExists } = useParticipants(roomId, finishInitialLoading);
  const { radius, setRadius, increaseRadius } = useRadiusStore();
  useCheckRoomAccess();

  const positions = useMemo(
    () => calculatePosition(Math.min(Object.keys(participants).length, 8), radius[0], radius[1]), //10명으로 제한
    [radius, participants]
  );

  const participantElements = useMemo(
    () =>
      Object.keys(participants).map((participantId) => {
        const index = participants[participantId]?.index || 0;
        const position = positions[index];

        return position ? (
          <UserProfile
            key={participantId}
            participant={participants[participantId]}
            isCurrentUser={participantId === currentUserId}
            isHost={hostId === participantId}
            position={{ x: position[0], y: position[1] }}
          />
        ) : null;
      }),
    [participants, positions, currentUserId, hostId]
  );

  // 참여자 수가 변경될 때마다 반지름 계산
  useEffect(() => {
    const count = Object.keys(participants).length;
    if (count > 3) {
      increaseRadius();
    }
  }, [participants]);

  useEffect(() => {
    // 화면 크기 변경 시 호출될 함수
    const handleResize = () => {
      const newRadius: [number, number] = calculateRadius();
      setRadius(newRadius);
    };

    // resize 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setRadius]);

  if (!roomExists) showBoundary(new Error(roomError.RoomNotFound));

  useEffect(() => {
    if (!initialLoading) {
      navigate(`/rooms/${params.roomId}/join`);
    }
  }, [initialLoading, params.roomId]);

  return (
    <>
      <Header />
      {initialLoading ? (
        <LoadingPage loadingMessage="관심사를 나누러 가는 중..." />
      ) : (
        <>
          <div css={backgroundStyle}>
            <div css={ParticipantsContainer(radius[0], radius[1])}>
              {participantElements}
              <div css={SubjectContainer(radius[0], radius[1])}>
                <Outlet />
              </div>
            </div>
            <ShareButton />
          </div>
          <ParticipantListSidebar currentUserId={currentUserId} />
        </>
      )}
    </>
  );
};
const RoomLayoutWithCatch = () => {
  return (
    <RoomCatchWrapper>
      <RoomLayout />
    </RoomCatchWrapper>
  );
};

export default RoomLayoutWithCatch;

const backgroundStyle = css`
  background: ${Variables.colors.surface_default};
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 100px; /* 헤더 높이를 고려한 여백 추가 */
`;

const ParticipantsContainer = (shortRadius: number, longRadius: number) => css`
  position: relative;
  width: ${longRadius * 2}px;
  height: ${shortRadius * 2}px;
  border-radius: 50%;
`;

const SubjectContainer = (shortRadius: number, longRadius: number) => css`
  width: 80%;
  position: absolute;
  bottom: ${shortRadius}px;
  left: ${longRadius}px;
  transform: translate(-50%, 50%);
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
