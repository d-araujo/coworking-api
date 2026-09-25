import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'; // <-- 1. Importar o módulo JWT
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard'; // <-- 3. Importar o RolesGuard
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    // 2. Configurando a máquina de crachás
    JwtModule.register({
      global: true, // Facilita para usarmos o crachá em outros lugares depois
      secret: process.env.JWT_SECRET, // A "assinatura" do servidor
      signOptions: { expiresIn: '15m' }, // O crachá expira em 1 hora
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy,
    RolesGuard,
    JwtAuthGuard,
  ], // (Mantenha os seus providers)
  exports: [JwtModule], // <-- Isso aqui permite que o UsersModule use o JwtService!
})
export class AuthModule {}
