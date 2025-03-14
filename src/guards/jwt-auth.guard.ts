import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../shared/decorators/roles.decorator';
import { RpcException } from '@nestjs/microservices';
import { jwtContants } from 'src/constants/constant';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  private extractTokenFromPayload(data: any): string | null {
    const token = data?.token || null;
    console.log('Extracted Token:', token);
    return token;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const data = context.switchToRpc().getData();
    console.log('Received Payload:', data);

    const token = this.extractTokenFromPayload(data);
    if (!token) {
      console.error(' No Token Provided');
      throw new RpcException({
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Token is missing',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtContants.secret,
      });

      console.log('✅ Decoded JWT:', payload);
      data.user = payload;

      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getClass(), context.getHandler()],
      );

      if (!requiredRoles) return true;
      if (!payload || !payload.role) {
        console.error('User role is missing');
        throw new RpcException({
          statusCode: 403,
          message: 'Forbidden',
          error: 'User role is required',
        });
      }

      return requiredRoles.includes(payload.role);
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      throw new RpcException({
        statusCode: 401,
        message: 'Unauthorized',
        error: error.message,
      });
    }
  }
}
