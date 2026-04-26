import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserModel } from 'src/db/models/user.model';
import { Booking, BookingModel } from 'src/db/models/booking.model';
import { JWTService } from 'src/db/utils/security/token';
import { JwtService as jwt } from '@nestjs/jwt';

@Module({
  imports: [UserModel, BookingModel],
  controllers: [AuthController],
  providers: [AuthService, User, Booking, JWTService, jwt],
})
export class AuthModule {}
