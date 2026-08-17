import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReservationDto) {
    const { roomId, startTime, endTime } = dto;

    // 1. Validação simples de datas
    const now = new Date();

    if (startTime < now) {
      throw new BadRequestException(
        'A data de início não pode ser no passado.',
      );
    }

    if (endTime <= startTime) {
      throw new BadRequestException(
        'O horário de término deve ser posterior ao horário de início.',
      );
    }

    // 2. Verificar se a sala existe
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Sala não encontrada.');
    }

    // 3. Verificar se a sala está ativa/disponível
    if (room.isActive === false) {
      throw new BadRequestException('Esta sala está em manutenção/inativa.');
    }

    // 4. Checagem de Conflito de Horário
    const conflictingReservation = await this.prisma.reservation.findFirst({
      where: {
        roomId,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (conflictingReservation) {
      throw new ConflictException(
        'A sala já está reservada para o horário solicitado.',
      );
    }

    // 5. Criação da Reserva no Banco de Dados
    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        roomId,
        startTime,
        endTime,
      },
    });

    return reservation;
  }
  // 1. Atualizada: Retorna apenas reservas FUTURAS/ATIVAS
  async getUserReservations(userId: string) {
    const now = new Date();

    const reservations = await this.prisma.reservation.findMany({
      where: {
        userId: userId,
        startTime: { gte: now }, // 👈 Maior ou igual a agora
      },
      include: { room: true },
      orderBy: { startTime: 'asc' }, // 💡 Ordena da mais próxima para a mais distante
    });

    return reservations; // Lembre-se: retornar array vazio [] é padrão de mercado se não houver dados!
  }

  async getReservationById(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        id: id,
        userId: userId, // 👈 Bloqueia se a reserva pertencer a outro usuário
      },
      include: {
        room: true, // 💡 Bônus: Retorna as informações da sala junto
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    return reservation;
  }

  async deleteReservationById(id: string, userId: string) {
    // 1. Busca a reserva (garantindo que pertence ao usuário)
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    // 2. Verifica se a reserva existe
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    // 3. Lógica das 24 horas
    const now = new Date();

    // getTime() converte a data para milissegundos
    const timeDifference = reservation.startTime.getTime() - now.getTime();

    // Converte milissegundos para horas (1000ms * 60seg * 60min)
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    // Se faltar menos de 24 horas, bloqueia a deleção
    if (hoursDifference < 24) {
      throw new BadRequestException(
        'O cancelamento só é permitido com pelo menos 24 horas de antecedência.',
      );
    }

    // 4. Executa a exclusão no banco de dados
    await this.prisma.reservation.delete({
      where: {
        id: id,
      },
    });

    return { message: 'Reserva cancelada com sucesso.' };
  }

  // 2. Nova: Retorna apenas o HISTÓRICO (Passadas)
  async getUserHistory(userId: string) {
    const now = new Date();

    const history = await this.prisma.reservation.findMany({
      where: {
        userId: userId,
        startTime: { lt: now }, // 👈 Menor que agora (já passou)
      },
      include: { room: true },
      orderBy: { startTime: 'desc' }, // 💡 Ordena da mais recente que passou para a mais antiga
    });

    return history;
  }
}
