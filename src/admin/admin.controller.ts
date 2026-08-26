import { Controller, Get, Delete, UseGuards, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin') // (Opcional) Agrupa as rotas bonitinho no Swagger
@ApiBearerAuth() // 👈 Exibe o ícone de cadeado para este Controller no Swagger
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('reservations')
  async getAllReservations() {
    return this.adminService.getAllReservations();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('reservations/:id')
  async deleteReservationById(@Param('id') id: string) {
    return this.adminService.deleteReservationById(id);
  }
}
