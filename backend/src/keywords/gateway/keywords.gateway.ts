import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit, UseFilters, UseGuards } from '@nestjs/common';

import { KeywordsRequestDto } from '../dto/keywords.request.dto';
import { KeywordsResponseDto } from '../dto/keywords.response.dto';
import { KeywordsService } from '../service/keywords.service';
import { KeywordsAlertDto } from '../dto/keywords.alert.dto';
import { PhaseKeywordGuard } from '../../common/guard/phase.guard';
import { SocketCustomExceptionFilter } from '../../common/filter/socket.custom-exception.filter';
import { LazyDeleteRoomEventOperator } from '../../common/event/lazy-delete-room-event-operator';

@WebSocketGateway()
@UseGuards(PhaseKeywordGuard)
@UseFilters(SocketCustomExceptionFilter)
export class KeywordsGateway implements OnModuleInit {
  constructor(
    private readonly keywordsService: KeywordsService,
    private readonly lazyDeleteRoomEventOperator: LazyDeleteRoomEventOperator,
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.lazyDeleteRoomEventOperator.on('delete-room', (roomId) => {
      this.keywordsService.deleteRoomKeywordsInfo(roomId);
    });
  }

  @SubscribeMessage('keyword:pick')
  pickKeyword(
    @ConnectedSocket() client: Socket,
    @MessageBody() { questionId, keyword }: KeywordsRequestDto,
  ): KeywordsResponseDto {
    const roomId = client.data.roomId;
    const clientId = client.id;
    const keywordsInfoDto = this.keywordsService.addKeyword(roomId, questionId, keyword, clientId);

    this.server.to(roomId).emit('empathy:keyword:count', KeywordsAlertDto.of(keywordsInfoDto));

    return new KeywordsResponseDto(keywordsInfoDto);
  }

  @SubscribeMessage('keyword:release')
  releaseKeyword(
    @ConnectedSocket() client: Socket,
    @MessageBody() { questionId, keyword }: KeywordsRequestDto,
  ): KeywordsResponseDto {
    const roomId = client.data.roomId;
    const clientId = client.id;
    const keywordsInfoDto = this.keywordsService.removeKeyword(roomId, questionId, keyword, clientId);

    this.server.to(roomId).emit('empathy:keyword:count', KeywordsAlertDto.of(keywordsInfoDto));

    return new KeywordsResponseDto(keywordsInfoDto);
  }
}
