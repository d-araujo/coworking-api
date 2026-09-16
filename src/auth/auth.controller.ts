import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto'; // 👈 Importamos o DTO
import { ResetPasswordDto } from './dto/reset-password.dto'; // 👈 Importamos o DTO
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth') // (Opcional) Agrupa as rotas bonitinho no Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginUser(
    @Request() req: { user: { id: string; email: string; role: string } },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() body: LoginDto,
  ) {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    if (!dto.refreshToken) {
      throw new BadRequestException('O campo refreshToken é obrigatório');
    }
    return this.authService.refreshTokens(dto.refreshToken);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    if (!dto.refreshToken) {
      throw new BadRequestException('O campo refreshToken é obrigatório');
    }
    return this.authService.logout(dto.refreshToken);
  }

  // 👇 NOVA ROTA PROTEGIDA COM O MIDDLEWARE
  @UseGuards(JwtAuthGuard) // <-- É assim que botamos o segurança na porta!
  @Get('profile')
  @ApiBearerAuth() // 👈 Exibe o ícone de cadeado para este Controller no Swagger
  getProfile(@Request() req: { user: { sub: string; email: string } }) {
    // Retornamos aquele payload que o Guard pendurou na requisição no passo anterior
    return req.user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
