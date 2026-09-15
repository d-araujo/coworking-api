import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  // O Passport injeta as strings separadas aqui, não um objeto DTO
  async validate(email: string, password: string): Promise<any> {
    // O AuthService também precisa esperar duas strings agora
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    return user;
  }
}
