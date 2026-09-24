import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module'; // <-- 1. Importamos o módulo de Auth

@Module({
  // 2. Colocamos o AuthModule na lista de imports para herdar o JwtService
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
