import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Trip } from './trip.model';
import { User } from './user.model';

Schema({
  timestamps: true,
});

export class Review {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
  })
  userId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: Trip.name,
  })
  tripId?: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 5,
  })
  stars?: number;

  @Prop({
    type: String,
    required: true,
  })
  comment?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

export const ReviewModel = MongooseModule.forFeature([
  {
    schema: ReviewSchema,
    name: Review.name,
  },
]);
