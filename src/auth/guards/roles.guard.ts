import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lemos quais roles a rota exige olhando a etiqueta @Roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se a rota não tiver a etiqueta, deixa passar (qualquer usuário logado acessa)
    if (!requiredRoles) {
      return true;
    }

    // 2. Pegamos o usuário que o AuthGuard pendurou na requisição
    // 2. Avisamos ao TypeScript o formato exato que esperamos na requisição
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role: string } }>();
    const user = request.user;

    // 3. Cruzamos a informação: a role do usuário está na lista de roles exigidas?
    const hasRole = requiredRoles.includes(user?.role || '');

    if (!hasRole) {
      // Usamos Forbidden (403) ao invés de Unauthorized (401).
      // 401 = Você não está logado. 403 = Você está logado, mas não tem permissão.
      throw new ForbiddenException(
        'Acesso negado: Você não tem permissão de Administrador.',
      );
    }

    return true;
  }
}
