import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    if (!result) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }

    return true;
  }
}
