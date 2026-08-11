import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  // Chamamos o JwtService para nos ajudar com a matemática da verificação
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Tipamos explicitamente o request usando Genéricos (<...>)
    // e avisamos que ele terá uma propriedade 'user'
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: any }>();

    // 2. Agora o TS sabe que 'request' é seguro para passar adiante
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Acesso negado: Token não encontrado no cabeçalho',
      );
    }

    try {
      // 4. Avisamos ao verifyAsync o formato esperado do payload para não ser 'any'
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
      }>(token, {
        secret: process.env.JWT_SECRET || 'minha_chave_secreta_super_segura',
      });

      // 5. Como tipamos o request lá em cima, agora podemos atribuir com segurança
      request.user = payload;
    } catch {
      throw new UnauthorizedException(
        'Acesso negado: Token inválido ou expirado',
      );
    }

    return true; // Catraca liberada!
  }
  // Função auxiliar para cortar a palavra "Bearer " e pegar só o texto do token
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
