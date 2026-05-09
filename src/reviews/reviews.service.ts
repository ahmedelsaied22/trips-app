import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from 'src/db/models/review.model';
import { Trip } from 'src/db/models/trip.model';
import { User } from 'src/db/models/user.model';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Trip.name) private readonly tripModel: Model<Trip>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  async addReview(
    user: User,
    tripId: Types.ObjectId,
    body: {
      stars: number;
      comment: string;
    },
  ) {
    const userExist = await this.userModel.findOne({ email: user.email });
    const trip = await this.tripModel.findById(tripId);
    if (!trip) throw new BadRequestException('this trip is deleted');

    const review = await this.reviewModel.create({
      userId: userExist?._id,
      tripId: trip._id,
      stars: body.stars,
      comment: body.comment,
    });

    return {
      data: review,
    };
  }

  async deleteReview(user: User, reviewId: Types.ObjectId) {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) throw new BadRequestException('this review is deleted');

    await this.reviewModel.deleteOne({ _id: reviewId });

    return {
      data: 'review deleted successfully',
    };
  }
}
