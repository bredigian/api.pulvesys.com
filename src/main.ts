import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { TEnvironment } from './types/environment.types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaulrSrc: ["'none'"],
          scriptSrc: ["'none'"],
          styleSrc: ["'none'"],
          imgSrc: ["'self"],
          connectSrc: [
            "'self'",
            'https://pulvesys.com',
            'https://beta.pulvesys.com',
          ],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  const ENVIRONMENT = process.env.NODE_ENV as TEnvironment;

  app.enableCors({
    origin:
      ENVIRONMENT === 'production'
        ? 'https://pulvesys.com'
        : ENVIRONMENT === 'beta'
          ? 'https://beta.pulvesys.com'
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.use(cookieParser());

  app.enableVersioning();

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT, () =>
    console.log('PulveSys API is running on the server ✅'),
  );
}
bootstrap();
