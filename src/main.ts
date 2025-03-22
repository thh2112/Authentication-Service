import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ENV_KEY } from './shared/constant';
import { QueryStringParserPipe } from './shared/pipes/query-string-parser.pipe';
import { HttpLoggingInterceptor } from './shared/interceptors/http-logging.interceptor';
import { HttpResponseInterceptor } from './shared/interceptors/http-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const logger = new Logger('MainApplication');

  app.useGlobalPipes(
    new QueryStringParserPipe(),
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(
    new HttpLoggingInterceptor(),
    new HttpResponseInterceptor(),
  );

  app.setGlobalPrefix('v1/api');

  const port = +configService.get(ENV_KEY.PORT, 3000);

  await app.listen(port, () =>
    logger.log(`Application is running on port ${port}`),
  );
}
bootstrap();
