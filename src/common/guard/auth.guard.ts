import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let token = request.headers['authoriztion']?.split(' ')[1];

    if (!token) {
      token = request.cookies.token;
    }

    try {
      const { id, role } = await this.jwtService.verifyAsync(token);
      request.user = { id, role };
      return true;
    } catch (error) {
      throw new ForbiddenException('Token invalid');
    }
  }
}
