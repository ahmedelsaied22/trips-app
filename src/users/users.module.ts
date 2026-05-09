import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserModel } from 'src/db/models/user.model';
import { JwtService } from '@nestjs/jwt';
import { JWTService } from 'src/db/utils/security/token';

@Module({
  imports: [UserModel],
  controllers: [UsersController],
  providers: [UsersService, User, JwtService, JWTService],
})
export class UsersModule {}
