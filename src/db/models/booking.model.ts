import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Trip } from './trip.model';
import { User } from './user.model';

export enum StatusEnum {
  pending = 'PENDING',
  confirmed = 'CONFIRMED',
}

Schema({
  timestamps: true,
});

export class Booking {
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
    type: String,
    required: true,
  })
  name?: string;

  @Prop({
    type: String,
    required: true,
  })
  email?: string;

  @Prop({
    type: String,
    required: true,
  })
  phone?: string;

  @Prop({
    type: Number,
    required: true,
  })
  numberOfPeople?: number;

  @Prop({
    type: String,
  })
  notes?: string;

  @Prop({
    type: String,
    default: StatusEnum.pending,
  })
  status?: StatusEnum;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

export const BookingModel = MongooseModule.forFeature([
  {
    schema: BookingSchema,
    name: Booking.name,
  },
]);
