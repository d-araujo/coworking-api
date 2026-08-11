import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'; // <-- 1. Importar o módulo JWT
import { PrismaService } from '../prisma/prisma.service'; // (Mantenha o que você já tinha)

@Module({
  imports: [
    // 2. Configurando a máquina de crachás
    JwtModule.register({
      global: true, // Facilita para usarmos o crachá em outros lugares depois
      secret: process.env.JWT_SECRET || 'minha_chave_secreta_super_segura', // A "assinatura" do servidor
      signOptions: { expiresIn: '1h' }, // O crachá expira em 1 hora
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService], // (Mantenha os seus providers)
  exports: [JwtModule], // <-- Isso aqui permite que o UsersModule use o JwtService!
})
export class AuthModule {}
