import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Delete,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator'; // Puxando o Segurança
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users') // (Opcional) Agrupa as rotas bonitinho no Swagger
@ApiBearerAuth() // 👈 Exibe o ícone de cadeado para este Controller no Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔍 ROTA GET: Retorna os dados do usuário autenticado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Request() req: { user: { id: string; email: string; role: string } },
  ) {
    // Pegamos o ID do usuário que o AuthGuard pendurou na requisição
    const userId = req.user.id;

    // Chamamos a função do Service (que vamos criar já já)
    return this.usersService.getUserProfile(userId);
  }

  // ✏️ ROTA PUT: Atualiza os dados do usuário autenticado
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(
    @Request() req: { user: { id: string; email: string; role: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.id;

    // Passamos o ID e os dados validados pelo DTO para o Service
    return this.usersService.updateUserProfile(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Request() req: { user: { id: string; email: string; role: string } },
  ) {
    const currentUserId = req.user.id;

    return this.usersService.deleteUser(id, currentUserId);
  }
}
