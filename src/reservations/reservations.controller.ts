import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Reservas') // (Opcional) Agrupa as rotas bonitinho no Swagger
@ApiBearerAuth() // 👈 Exibe o ícone de cadeado para este Controller no Swagger
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: { user: { id: string; email: string; role: string } },
    @Body() createReservationDto: CreateReservationDto,
  ) {
    const userId = req.user.id;
    return this.reservationsService.create(userId, createReservationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getReservations(
    @Request() req: { user: { id: string; email: string; role: string } },
  ) {
    const userId = req.user.id;
    return this.reservationsService.getUserReservations(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history') // 👈 IMPORTANTE: Deve ficar antes do @Get(':id')
  async getHistory(
    @Request() req: { user: { id: string; email: string; role: string } },
  ) {
    const userId = req.user.id;
    return this.reservationsService.getUserHistory(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getReservationById(
    @Param('id') id: string,
    @Request() req: { user: { id: string; email: string; role: string } }, // 👈 Pegamos o usuário logado
  ) {
    const userId = req.user.id;
    return this.reservationsService.getReservationById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReservationById(
    @Param('id') id: string,
    @Request() req: { user: { id: string; email: string; role: string } }, // 👈 Pegamos o usuário logado
  ) {
    const userId = req.user.id;
    return this.reservationsService.deleteReservationById(id, userId);
  }
}
