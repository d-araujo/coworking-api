import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'; // <-- 1. Importamos o bcrypt
import * as nodemailer from 'nodemailer'; // 👈 Adicione no topo do arquivo
import { LoginDto } from './dto/login.dto'; // <-- Importamos o DTO
import { JwtService } from '@nestjs/jwt'; // <-- Importamos o serviço de JWT
import { ForgotPasswordDto } from './dto/forgot-password.dto'; // 👈 Importamos o DTO
import { ResetPasswordDto } from './dto/reset-password.dto'; // 👈 Importamos o DTO

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

  private async sendEmail(to: string, code: string) {
    // 1. Gera uma conta de teste temporária
    const testAccount = await nodemailer.createTestAccount();

    // 2. Configura o "carteiro" (transporter)
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // 3. Envia o e-mail de fato
    const info = await transporter.sendMail({
      from: '"Coworking API" <no-reply@coworking.com>',
      to: to,
      subject: 'Seu código de recuperação de senha',
      text: `Seu código de redefinição de senha é: ${code}. Ele expira em 15 minutos.`,
    });

    // 4. Imprime no console um LINK FALSO para você ler o e-mail!
    console.log('Mensagem enviada: %s', info.messageId);
    console.log('🔗 URL do e-mail: %s', nodemailer.getTestMessageUrl(info));
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // 1. Busca se o usuário existe
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Retorno padrão de segurança para não expor quem tem conta no sistema
    const successMessage = {
      message:
        'Se o e-mail estiver cadastrado, você receberá um código de verificação.',
    };

    if (!user) {
      return successMessage;
    }

    // 2. Gera um código de 6 dígitos aleatório
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Calcula a validade de 15 minutos a partir de agora
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 4. Salva o código e a validade no banco de dados do usuário
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetCode,
        resetPasswordExpires: expiresAt,
      },
    });

    // 5. Dispara o e-mail
    await this.sendEmail(user.email, resetCode);

    return successMessage;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, newPassword } = resetPasswordDto;

    // 1. Busca o usuário
    const user = await this.prisma.user.findUnique({ where: { email } });

    // 2. Verifica se o usuário existe, se o código bate e se não expirou
    // Usamos a mesma mensagem genérica para não dar pistas a invasores
    if (
      !user ||
      user.resetPasswordToken !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException(
        'Código de verificação inválido ou expirado.',
      );
    }

    // 3. Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Atualiza a senha no banco e LIMPA os campos de recuperação
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return {
      message: 'Senha redefinida com sucesso! Você já pode fazer login.',
    };
  }
}
