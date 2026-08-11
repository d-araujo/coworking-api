import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- Importar

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

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
});
