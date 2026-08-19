import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';
import { Prisma } from '@prisma/client'; // <-- Precisamos importar isso para ler o erro

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: createRoomDto,
    });

    return room;
  }
  // 2. Rota GET (Busca todas as salas cadastradas)
  async findAll(userRole: string) {
    // 1. Se o usuário for ADMINISTRADOR, retorna absolutamente todas as salas
    if (userRole === 'ADMIN') {
      return this.prisma.room.findMany();
    }

    // 2. Caso contrário (usuário comum), retorna apenas as salas disponíveis
    return this.prisma.room.findMany({
      where: {
        isActive: true,
      },
    });
  }

  // Buscar por ID
  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    // Se a sala não for encontrada no banco, lança erro 404
    if (!room) {
      throw new NotFoundException('Sala não encontrada.');
    }

    return room;
  }

  async updateRoom(roomId: string, data: UpdateRoomDto) {
    try {
      const updatedRoom = await this.prisma.room.update({
        where: { id: roomId },
        data: data,
      });

      return updatedRoom;
    } catch (error) {
      // Verifica se o erro é do Prisma e se o código é o P2025 (Registro não encontrado)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Sala não encontrada para atualização.');
      }

      // Se for qualquer outro erro bizarro, lança ele normalmente
      throw error;
    }
  }

  async updateRoomStatus(roomId: string, data: UpdateRoomStatusDto) {
    try {
      const updatedRoom = await this.prisma.room.update({
        where: { id: roomId },
        data: data,
      });

      return updatedRoom;
    } catch (error) {
      // Verifica se o erro é do Prisma e se o código é o P2025 (Registro não encontrado)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Sala não encontrada para atualização.');
      }

      // Se for qualquer outro erro bizarro, lança ele normalmente
      throw error;
    }
  }

  async deleteRoom(roomId: string) {
    try {
      const deleteRoom = await this.prisma.room.delete({
        where: {
          id: roomId,
        },
      });
      return deleteRoom;
    } catch (error) {
      // Verifica se o erro é do Prisma e se o código é o P2025 (Registro não encontrado)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Sala não encontrada para deleção.');
      }

      // Se for qualquer outro erro bizarro, lança ele normalmente
      throw error;
    }
  }
}
