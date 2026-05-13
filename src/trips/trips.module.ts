import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { User, UserModel } from '../db/models/user.model';
import { JWTService } from '../db/utils/security/token';
import { JwtService as jwt } from '@nestjs/jwt';
import { Trip, TripModel } from '../db/models/trip.model';
import { createClient } from 'redis';

@Module({
  imports: [TripModel, UserModel],
  controllers: [TripsController],
  providers: [
    TripsService,
    jwt,
    JWTService,
    User,
    Trip,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = createClient({
          url: 'redis://127.0.0.1:6379',
        });
        client.connect();
        client.on('error', (err) => {
          console.log('redis connection error => ', err);
        });
        console.log('redis connected successfully');
        return client;
      },
    },
  ],
})
export class TripsModule {}
