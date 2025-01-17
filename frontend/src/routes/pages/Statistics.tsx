import { css, keyframes } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useToast } from '@/hooks';
import LoadingPage from '@/routes/pages/LoadingPage';
import { useParticipantsStore, useRadiusStore, useSocketStore } from '@/stores';
import { Variables } from '@/styles/variables';
import { CommonResult } from '@/types';

const StatisticsPhaseView = () => {
  const { socket } = useSocketStore();
  const { setParticipants } = useParticipantsStore();
  const { setOutOfBounds } = useRadiusStore();
  const { openToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const handleResult = (response: CommonResult) => {
    if (response) {
      setIsLoading(false);
      Object.entries(response).forEach(([userId, array]) => {
        setParticipants((prev) => ({ ...prev, [userId]: { ...prev[userId], keywords: array } }));
      });
      setOutOfBounds(false); //사용자 ui 원위치로

      // 2초 후 페이드아웃하면서 컨텐츠 공유 페이지로 이동
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          navigate(`/rooms/${params.roomId}/content-share`);
        }, 1000);
      }, 2000);
    } else {
      openToast({ type: 'error', text: '통계 분석 중 오류가 발생했습니다. 다시 시도해주세요' });
    }
  };

  useEffect(() => {
    socket.on('empathy:result', handleResult);
    return () => {
      socket.off('empathy:result', handleResult);
    };
  }, []);

  return isLoading ? (
    <LoadingPage isAnalyzing={true} />
  ) : (
    <div css={ResultInstructionStyle(isFadingOut)}>우리가 함께 지닌 공감 포인트들</div>
  );
};

export default StatisticsPhaseView;

// 페이드아웃 애니메이션 정의
const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const ResultInstructionStyle = (isFadingOut: boolean) => css`
  width: 100%;
  font: ${Variables.typography.font_bold_24};
  text-align: center;
  opacity: ${isFadingOut ? 0 : 1};
  animation: ${isFadingOut ? fadeOut : 'none'} 1s forwards; // 1초 동안 페이드아웃
  transition: opacity 0.5s ease-in-out;
`;
