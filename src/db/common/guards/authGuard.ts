/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../models/user.model';
import { JWTService } from '../../utils/security/token';

export interface AuthReq extends Request {
  user: UserDocument | Partial<User>;
  token: string;
  path: string;
  query: string;
}

export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JWTService,
    @InjectModel(User.name) private readonly useModel: Model<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: AuthReq = context.switchToHttp().getRequest();
      const auth = req.headers['authorization'];

      if (!auth!.startsWith(process.env.BEARER))
        throw new BadRequestException('invalid token');

      const token = auth.split(' ')[1];
      if (!token) throw new BadRequestException('you should login first');
      const payload: {
        id: Types.ObjectId;
        email: string;
      } = await this.jwtService.verify({
        token,
        options: {
          secret: process.env.SECRET_ACCESS_TOKEN,
        },
      });
      const user = await this.useModel.findById(payload.id);
      if (!user) throw new NotFoundException('user is deleted');
      if (!user.isConfirmed)
        throw new BadRequestException('email not confirmed');

      req.token = token;
      req.user = user;
      return true;
    } catch (error) {
      throw new BadRequestException('authontication error => ' + error);
    }
  }
}
