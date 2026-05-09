import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard, type AuthReq } from 'src/db/common/guards/authGuard';
import { Types } from 'mongoose';
import { AdminGuard } from 'src/db/common/guards/adminGuard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('add-review/:tripId')
  @UseGuards(AuthGuard)
  async addReview(
    @Req() req: AuthReq,
    @Param('tripId') tripId: Types.ObjectId,
    @Body()
    body: {
      stars: number;
      comment: string;
    },
  ) {
    const user = req.user;

    return await this.reviewsService.addReview(user, tripId, body);
  }

  @Delete('delete-review/:reviewId')
  @UseGuards(AuthGuard, AdminGuard)
  async deleteReview(
    @Req() req: AuthReq,
    @Param('reviewId') reviewId: Types.ObjectId,
  ) {
    const user = req.user;

    return await this.reviewsService.deleteReview(user, reviewId);
  }
}
