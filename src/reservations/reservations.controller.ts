import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Reservas') // (Opcional) Agrupa as rotas bonitinho no Swagger
@ApiBearerAuth() // 👈 Exibe o ícone de cadeado para este Controller no Swagger
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: { user: { sub: string } },
    @Body() createReservationDto: CreateReservationDto,
  ) {
    const userId = req.user.sub;
    return this.reservationsService.create(userId, createReservationDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getReservations(@Req() req: { user: { sub: string } }) {
    const userId = req.user.sub;
    return this.reservationsService.getUserReservations(userId);
  }

  @UseGuards(AuthGuard)
  @Get('history') // 👈 IMPORTANTE: Deve ficar antes do @Get(':id')
  async getHistory(@Req() req: { user: { sub: string } }) {
    const userId = req.user.sub;
    return this.reservationsService.getUserHistory(userId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getReservationById(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }, // 👈 Pegamos o usuário logado
  ) {
    const userId = req.user.sub;
    return this.reservationsService.getReservationById(id, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteReservationById(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }, // 👈 Pegamos o usuário logado
  ) {
    const userId = req.user.sub;
    return this.reservationsService.deleteReservationById(id, userId);
  }
}
