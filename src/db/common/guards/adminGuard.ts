import {
  BadRequestException,
  Body,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { type AuthReq } from './authGuard';
import { RoleEnum } from 'src/db/models/user.model';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthReq>();
    const user = req.user;

    if (!user) throw new BadRequestException('login first');
    if (user.role != RoleEnum.ADMIN) {
      throw new BadRequestException('unauthorized access');
    }
    return true;
  }
}
