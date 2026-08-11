import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client'; // <-- 1. Importamos os tipos nativos do Prisma

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // 2. Mudamos o tipo de userId para string
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  // 3. Mudamos o tipo de userId para string
  async updateUserProfile(userId: string, data: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      // 4. Checagem segura de tipo: validamos se o erro é realmente do Prisma antes de ler o .code
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Este e-mail já está sendo utilizado por outra conta.',
        );
      }
      throw error;
    }
  }
}
