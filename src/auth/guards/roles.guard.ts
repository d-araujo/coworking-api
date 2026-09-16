import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lê os cargos exigidos pela rota
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. Se a rota não exigir nenhum cargo, libera o acesso
    if (!requiredRoles) {
      return true;
    }

    // 3. Pega o usuário que foi injetado pelo JwtAuthGuard
    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: { role: string } }>();

    // 4. Verifica se o cargo do usuário está na lista de cargos exigidos
    return requiredRoles.some((role) => user?.role === role);
  }
}
