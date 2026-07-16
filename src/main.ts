import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

const defaultCorsOrigins = [
  'https://paintcart.in',
  'https://www.paintcart.in',
  'http://localhost:8081',
  'http://localhost:5173',
];

const configuredCorsOrigins =
  process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const allowedCorsOrigins = new Set([
  ...defaultCorsOrigins,
  ...configuredCorsOrigins,
]);

const isAllowedCorsOrigin = (origin?: string) => {
  if (!origin) return true;
  if (allowedCorsOrigins.has('*') || allowedCorsOrigins.has(origin))
    return true;

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.amplifyapp.com');
  } catch {
    return false;
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, isAllowedCorsOrigin(origin));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use('/uploads', express.static('uploads'));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Paintkart API')
    .setDescription('Paint & hardware e-commerce API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Health check
  app.getHttpAdapter().get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
