import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'; // <-- 1. Importamos o bcrypt
import { LoginDto } from './dto/login.dto'; // <-- Importamos o DTO
import { JwtService } from '@nestjs/jwt'; // <-- Importamos o serviço de JWT

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    // 2. O Chef pega a senha original e tempera (criptografa) com 10 "voltas" de complexidade
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword, // <-- 3. Salvamos a senha embaralhada!
      },
    });

    return {
      message: 'Usuário criado com sucesso!',
      user,
    };
  }

  async login(data: LoginDto) {
    // 1. Procuramos o usuário na despensa (Banco de Dados) pelo e-mail
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    // 2. Se o usuário não existir, barramos a porta (Erro 401)
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // 3. Comparamos a senha digitada com a senha embaralhada do banco
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // 4. Se chegou até aqui, o usuário provou quem é! Vamos montar o crachá (Payload)
    // Usamos 'sub' (subject) porque é o padrão oficial do JWT para guardar IDs
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role, // <-- Adicionamos o cargo aqui!
    };

    // 5. Assinamos o crachá
    const token = await this.jwtService.signAsync(payload);

    // 6. Entregamos o crachá para o usuário
    return {
      message: 'Login realizado com sucesso!',
      access_token: token,
    };
  }
}
