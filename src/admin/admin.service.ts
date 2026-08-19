import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllReservations() {
    const reservations = await this.prisma.reservation.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }, // Traz dados do usuário (excluindo a senha por segurança)
        },
        room: true, // Traz os dados completos da sala
      },
    });

    return reservations;
  }

  async deleteReservationById(reservationId: string) {
    // 1. Verifica se a reserva existe no banco
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    const deleteReservation = await this.prisma.reservation.delete({
      where: {
        id: reservationId,
      },
    });

    return deleteReservation;
  }
}
