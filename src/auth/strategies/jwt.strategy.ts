import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// Tipagem do Payload contido dentro do token decodificado
export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Bloqueia tokens expirados automaticamente (Erro 401)
      secretOrKey: process.env.JWT_SECRET || 'minha_chave_secreta_super_segura',
    });
  }

  // Removido o 'async' para eliminar o aviso de 'no-await'
  validate(payload: JwtPayload) {
    // O retorno desta função será inserido em req.user nas rotas protegidas
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
