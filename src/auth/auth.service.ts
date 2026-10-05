import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'; // <-- 1. Importamos o bcrypt
import * as nodemailer from 'nodemailer'; // 👈 Adicione no topo do arquivo
import { JwtService } from '@nestjs/jwt'; // <-- Importamos o serviço de JWT
import { ForgotPasswordDto } from './dto/forgot-password.dto'; // 👈 Importamos o DTO
import { ResetPasswordDto } from './dto/reset-password.dto'; // 👈 Importamos o DTO
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const emailAlreadyUsed = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailAlreadyUsed) {
      throw new ConflictException('E-mail já cadastrado');
    }
    // 2. O Chef pega a senha original e tempera (criptografa) com 10 "voltas" de complexidade
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword, // <-- 3. Salvamos a senha embaralhada!
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      message: 'Usuário criado com sucesso!',
      user,
    };
  }

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // 2. Compare usando a variável 'pass'
    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // 3. Isole APENAS a senha. Deixe o 'id' ir para o result!
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }

  async login(user: { id: string; email: string; role: string }) {
    // 1. GERAÇÃO DO ACCESS TOKEN (Continua igual)
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    // 2. GERAÇÃO DO REFRESH TOKEN (String opaca segura)
    // Cria uma string aleatória de 64 caracteres hexadecimais
    const refreshToken = crypto.randomBytes(32).toString('hex');

    // 3. CÁLCULO DE EXPIRAÇÃO
    // Define que esse Refresh Token vai durar 7 dias
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. SALVAR NO BANCO DE DADOS
    // Registramos essa nova "sessão" atrelada ao usuário
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    // 5. RETORNO PARA O FRONTEND
    return {
      message: 'Login realizado com sucesso!',
      access_token: accessToken,
      refresh_token: refreshToken, // 👈 Agora entregamos as duas chaves!
    };
  }
  async refreshTokens(refreshToken: string) {
    // 1. Busca o token no banco junto com os dados do usuário
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // 2. Se o token não existir ou a data atual for maior que a expiração, nega o acesso
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    // 3. Monta o payload padronizado usando os dados do usuário encontrado
    const payload = {
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
    };

    // 4. Gera um novo Access Token
    const newAccessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: newAccessToken,
    };
  }

  async logout(refreshToken: string) {
    // Usamos deleteMany para não estourar erro caso o token já tenha sido removido
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return { message: 'Logout realizado com sucesso!' };
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
    const resetCode = crypto
      .randomInt(0, 1_000_000)
      .toString()
      .padStart(6, '0');

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
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

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
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      await tx.refreshToken.deleteMany({
        where: { userId: user.id },
      });
    });

    return {
      message: 'Senha redefinida com sucesso! Você já pode fazer login.',
    };
  }
}
