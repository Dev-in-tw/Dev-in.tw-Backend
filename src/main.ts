import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Dev-in.tw API Document")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.getOrThrow<string>("CORS_ORIGIN").split(","),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // `|| 3001` (not `??`) so an empty PORT="" also falls back instead of binding a random port.
  const port = configService.get<number>("PORT") || 3001;

  await app.listen(port);
}

void bootstrap();
