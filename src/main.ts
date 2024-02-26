import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { config as dotenvConfig } from "dotenv";
import mongoose from "mongoose";

import { AppModule } from "./app.module";


dotenvConfig();

async function bootstrap() {
  await connectMongoDB(process.env.MONGO_URI);

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Dev-in.tw API Document")
    // .setDescription("The Dev-in.tw API description")
    .setVersion("1.0")
    // .addTag("cats")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();

async function connectMongoDB(uri: string) {
  const db = await mongoose.connect(uri, { authSource: "admin" });
  // eslint-disable-next-line no-console
  console.log(
    `Server : successfully connected to MongoDB, Database name: "${db.connections[0].name}"`,
  );
}
