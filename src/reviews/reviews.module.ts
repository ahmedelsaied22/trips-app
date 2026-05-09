import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { User, UserModel } from 'src/db/models/user.model';
import { Trip, TripModel } from 'src/db/models/trip.model';
import { JwtService as jwt } from '@nestjs/jwt';
import { JWTService } from 'src/db/utils/security/token';
import { Review, ReviewModel } from 'src/db/models/review.model';

@Module({
  imports: [ReviewModel, UserModel, TripModel],
  controllers: [ReviewsController],
  providers: [ReviewsService, jwt, JWTService, User, Trip, Review],
})
export class ReviewsModule {}
