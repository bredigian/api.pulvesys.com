import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableVersioning();

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT, () =>
    console.log('API Server is running at PORT', PORT),
  );
}
bootstrap();
