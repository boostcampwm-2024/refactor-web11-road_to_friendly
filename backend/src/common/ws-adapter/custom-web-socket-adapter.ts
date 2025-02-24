import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { RequestHandler } from 'express';
import { EventEmitter } from 'node:events';
import { validate as isValidUUID } from 'uuid';

export class CustomWebSocketAdapter extends IoAdapter {
  private readonly sessionMiddleware: RequestHandler;
  private readonly eventOperator: EventEmitter;

  constructor(appOrHttpServer: any, sessionMiddleware: RequestHandler, eventOperator: EventEmitter) {
    super(appOrHttpServer);
    this.sessionMiddleware = sessionMiddleware;
    this.eventOperator = eventOperator;
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  createIOServer(port: number, options?: ServerOptions & { namespace?: string; server?: any }): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.ORIGIN,
        credentials: true
      },
    });

    server.engine.use(this.sessionMiddleware);

    const adapter = server.of('/').adapter;

    adapter.on('delete-room', (roomId: string) => {
      if (isValidUUID(roomId)) {
        this.eventOperator.emit('lazy-delete-room', roomId);
      }
    });

    adapter.on('create-room', (roomId: string) => {
      if (isValidUUID(roomId)) {
        this.eventOperator.emit('cancel-lazy-delete-room', roomId);
      }
    });

    return server;
  }
}
