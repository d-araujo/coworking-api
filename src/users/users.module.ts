import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module'; // <-- 1. Importamos o módulo de Auth
import { PrismaService } from '../prisma/prisma.service'; // <-- (Ajuste o caminho se necessário)

@Module({
  // 2. Colocamos o AuthModule na lista de imports para herdar o JwtService
  imports: [AuthModule],
  controllers: [UsersController],
  // 3. Adicionamos o PrismaService para o Service conseguir falar com o banco de dados
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
