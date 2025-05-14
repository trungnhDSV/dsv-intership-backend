import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  });
  const port = process.env.PORT ?? 8080;
  if (process.env.NODE_ENV === 'development') {
    app.use(
      morgan(':method :url :status :res[content-length] - :response-time ms'),
    );
    console.log('🚀 Morgan enabled (development mode)');
  }

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
