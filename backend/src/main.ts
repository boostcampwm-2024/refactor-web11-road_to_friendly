import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { CustomWebSocketAdapter } from './common/ws-adapter/custom-web-socket-adapter';
import * as session from 'express-session';
import { DAY } from './common/definition/time';
import { LazyDeleteRoomEventOperator } from './common/event/lazy-delete-room-event-operator';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: process.env.ORIGIN, credentials: true });

  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: DAY,
    }
  });
  app.use(sessionMiddleware);

  const lazyDeleteRoomEventOperator = app.get(LazyDeleteRoomEventOperator);

  app.useWebSocketAdapter(new CustomWebSocketAdapter(app, sessionMiddleware, lazyDeleteRoomEventOperator));

  await app.listen(process.env.PORT ?? 8080);
}

bootstrap();
