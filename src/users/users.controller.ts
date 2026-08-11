import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator'; // Puxando o Segurança

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔍 ROTA GET: Retorna os dados do usuário autenticado
  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Request() req: { user: { sub: string; email: string } }) {
    // Pegamos o ID do usuário que o AuthGuard pendurou na requisição
    const userId = req.user.sub;

    // Chamamos a função do Service (que vamos criar já já)
    return this.usersService.getUserProfile(userId);
  }

  // ✏️ ROTA PUT: Atualiza os dados do usuário autenticado
  @UseGuards(AuthGuard)
  @Put('me')
  async updateProfile(
    @Request() req: { user: { sub: string; email: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.sub;

    // Passamos o ID e os dados validados pelo DTO para o Service
    return this.usersService.updateUserProfile(userId, updateUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } },
  ) {
    const currentUserId = req.user.sub;

    return this.usersService.deleteUser(id, currentUserId);
  }
}
