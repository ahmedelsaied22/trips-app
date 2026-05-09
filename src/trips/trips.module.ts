import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { User, UserModel } from 'src/db/models/user.model';
import { JWTService } from 'src/db/utils/security/token';
import { JwtService as jwt } from '@nestjs/jwt';
import { Trip, TripModel } from 'src/db/models/trip.model';

@Module({
  imports: [TripModel, UserModel],
  controllers: [TripsController],
  providers: [TripsService, jwt, JWTService, User, Trip],
})
export class TripsModule {}
