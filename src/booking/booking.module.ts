import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { User, UserModel } from 'src/db/models/user.model';
import { Trip, TripModel } from 'src/db/models/trip.model';
import { JwtService as jwt } from '@nestjs/jwt';
import { JWTService } from 'src/db/utils/security/token';
import { Booking, BookingModel } from 'src/db/models/booking.model';

@Module({
  imports: [UserModel, TripModel, BookingModel],
  controllers: [BookingController],
  providers: [BookingService, User, JWTService, jwt, Booking, Trip],
})
export class BookingModule {}
