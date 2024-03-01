import { config as dotenvConfig } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { SwaggerTheme } from "swagger-themes";
import { SwaggerThemeNameEnum } from "swagger-themes/build/enums";
import mongoose from "mongoose";

import packageJson from "../package.json";
import { AppModule } from "./app.module";


dotenvConfig();

async function bootstrap() {
  await connectMongoDB(process.env.MONGO_URI);

  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle("Dev-in.tw API Document")
    .setDescription("Dev-in.tw Backend API")
    .setVersion(packageJson.version)
    .addServer("http://localhost:3000/", "Local")
    .addServer("https://api-dev.dev-in.tw/", "Development")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();
  SwaggerModule.setup(
    "docs",
    app,
    document,
    theme.getDefaultConfig(SwaggerThemeNameEnum.ONE_DARK),
  );

  await app.listen(process.env.PORT || 3001);
}
bootstrap();

async function connectMongoDB(uri: string) {
  const logger = new Logger("MongoDB");

  const db = await mongoose.connect(uri, {
    authSource: "admin",
    dbName: "backend"
  });

  logger.log(`Successfully connected to database "${db.connections[0].name}"`);
}
