import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Trip {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  title?: string;

  @Prop({
    type: String,
    required: true,
  })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
  })
  price?: number;

  @Prop({
    type: String,
    required: true,
  })
  location?: string;

  @Prop({
    type: Date,
    required: true,
  })
  startDate?: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate?: Date;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  availableSeats!: number;

  @Prop({
    type: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
  })
  images?: {
    secure_url?: string;
    public_id?: string;
  }[];
}

export const TripSchema = SchemaFactory.createForClass(Trip);

export const TripModel = MongooseModule.forFeature([
  {
    name: Trip.name,
    schema: TripSchema,
  },
]);
