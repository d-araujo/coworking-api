import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard'; // <-- Importamos o nosso segurança

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async loginUser(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  // 👇 NOVA ROTA PROTEGIDA COM O MIDDLEWARE
  @UseGuards(AuthGuard) // <-- É assim que botamos o segurança na porta!
  @Get('profile')
  getProfile(@Request() req: { user: { sub: string; email: string } }) {
    // Retornamos aquele payload que o Guard pendurou na requisição no passo anterior
    return req.user;
  }
}
