import { EventEmitter } from 'node:events';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SECOND } from '../definition/time';

@Injectable()
export class LazyDeleteRoomEventOperator extends EventEmitter implements OnModuleInit {
  private readonly lazyDeleteInfo = new Map<string, any>();

  onModuleInit(): any {
    this.on('lazy-delete-room', (roomId: string) => {
      this.lazyDeleteInfo.set(roomId, setTimeout(() => this.lazyDelete(roomId), 5 * SECOND));
    });

    this.on('cancel-lazy-delete-room', (roomId: string) => {
      clearTimeout(this.lazyDeleteInfo.get(roomId));
      this.lazyDeleteInfo.delete(roomId);
    });
  }

  lazyDelete(roomId: string) {
    this.lazyDeleteInfo.delete(roomId);
    this.emit('delete-room', roomId);
  }
}
