import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto'; // 👈 Importamos o DTO
import { ResetPasswordDto } from './dto/reset-password.dto'; // 👈 Importamos o DTO
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @Post('logout')
  @HttpCode(HttpStatus.OK) // Retorna 200 OK em vez do 201 padrão do POST
  @UseGuards(JwtAuthGuard) // 👈 Adicione o seu Guard de autenticação aqui, se quiser exigir que a pessoa esteja logada para deslogar
  @ApiBearerAuth()
  logout() {
    return {
      message:
        'Logout realizado com sucesso. O token deve ser removido pelo cliente.',
    };
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
