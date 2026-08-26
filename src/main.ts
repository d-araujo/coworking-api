import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- Importar
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 👈 Importação nova

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 🧹 MÁGICA 1: Remove qualquer campo que não esteja no DTO silenciosamente.
      forbidNonWhitelisted: true, // 🚨 MÁGICA 2: (Opcional, mas recomendado) Em vez de só remover silenciosamente, ele bloqueia a requisição e dá erro 400 dizendo que enviaram dados não permitidos.
      transform: true, // Converte os tipos de dados automaticamente (ex: string de URL para número)
    }),
  );

  // 📖 Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Coworking API')
    .setDescription('API REST para gestão de espaço de coworking.')
    .setVersion('1.0')
    .addBearerAuth() // 👈 Adiciona o botão para inserir o token JWT na documentação
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 👈 Define que a doc ficará na rota /api

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
});
