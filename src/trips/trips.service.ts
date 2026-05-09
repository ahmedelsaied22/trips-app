import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/db/models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Trip } from 'src/db/models/trip.model';
import { Model, Types } from 'mongoose';
import {
  deleteImage,
  uploadBufferToCloudinary,
} from 'src/db/utils/images/upload';

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Trip.name) private readonly tripsModel: Model<Trip>,
  ) {}

  async createTrip({
    data,
    user,
    images,
  }: {
    data: {
      title: string;
      description: string;
      price: number;
      location: string;
      startDate: Date;
      endDate: Date;
      availableSeats: number;
    };
    user: User;
    images: {
      secure_url: string;
      public_id: string;
    }[];
  }) {
    const trip = await this.tripsModel.findOne({
      title: data.title,
    });
    if (trip) {
      await Promise.all(
        images.map(async (image) => {
          await deleteImage(image.public_id);
        }),
      );
      throw new BadRequestException('this trip already exist');
    }

    const userExist = await this.userModel.findOne({ email: user.email });
    if (!userExist) throw new BadRequestException('unAuthorized');

    const newTrip = await this.tripsModel.create({
      title: data.title,
      description: data.description,
      userId: userExist._id,
      price: data.price,
      location: data.location,
      startDate: data.startDate,
      endDate: data.endDate,
      availableSeats: data.availableSeats,
      images,
    });

    return {
      data: newTrip,
    };
  }

  async getAllTrips() {
    const trips = await this.tripsModel.find({});
    return {
      data: trips,
    };
  }

  async updateTrip(
    tripId: Types.ObjectId,
    data: {
      title: string;
      description: string;
      price: number;
      location: string;
      startDate: Date;
      endDate: Date;
      availableSeats: number;
      images: [];
    },
  ) {
    const trip = await this.tripsModel.findById(new Types.ObjectId(tripId));
    if (!trip) throw new BadRequestException('this trip is deleted');

    const uploadedImagesLength = trip.images?.length;
    const newImagesLegth = data.images.length;
    const sum = uploadedImagesLength || 0 + newImagesLegth || 0;
    const images = trip.images || [];

    if (sum > 8 && images) {
      await Promise.all(
        images.map(async (file) => {
          await deleteImage(file.public_id as string);
        }),
      );
    }

    await Promise.all(
      data.images.map(
        async (file: {
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          buffer: Buffer;
          size: number;
        }) => {
          const image = await uploadBufferToCloudinary(file.buffer);
          trip.images?.push(image);
        },
      ),
    );

    trip.title = data.title || trip.title;
    trip.description = data.description || trip.description;
    trip.price = Number(data.price || trip.price);
    trip.location = data.location || trip.location;
    trip.startDate = new Date(data.startDate || trip.startDate);
    trip.endDate = new Date(data.endDate || trip.endDate);
    trip.availableSeats = Number(data.availableSeats || trip.availableSeats);
    trip.__v = trip.__v + 1;

    await trip.save();
    return {
      data: 'trip updated successfully',
    };
  }

  async deleteTrip(tripId: Types.ObjectId) {
    const trip = await this.tripsModel.findById(tripId);
    if (!trip) throw new BadRequestException('this trip already deleted');

    await this.tripsModel.deleteOne({ _id: tripId });

    return {
      data: 'trip deleted successfully',
    };
  }
}
