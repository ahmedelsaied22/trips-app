import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, StatusEnum } from 'src/db/models/booking.model';
import { Trip } from 'src/db/models/trip.model';
import { User } from 'src/db/models/user.model';
import { confirmBookingTemplate } from 'src/db/utils/email/confirmBooking';
import {
  Email_Events_Enum,
  EmailEmitter,
} from 'src/db/utils/email/email.events';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Trip.name) private readonly tripModel: Model<Trip>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
  ) {}

  async createBooking(
    body: {
      phone: string;
      numberOfPeople: number;
      notes: string;
    },
    user: User,
    tripId: Types.ObjectId,
  ) {
    const userExist = await this.userModel.findOne({ email: user.email });
    const trip = await this.tripModel.findById(tripId);
    if (!trip || trip.availableSeats == undefined)
      throw new BadRequestException('not found trip');

    if (trip.availableSeats == 0 || trip.availableSeats < body.numberOfPeople) {
      throw new BadRequestException(
        `unavailable this number of seats => ,
        ${body.numberOfPeople}`,
      );
    }

    if (trip.availableSeats == 0)
      throw new BadRequestException('unavailabel seats');
    const booking = await this.bookingModel.create({
      userId: userExist?._id,
      tripId,
      name: user.name,
      email: user.email,
      phone: body.phone,
      numberOfPeople: body.numberOfPeople,
      notes: body.notes,
      status: StatusEnum.pending,
    });

    trip.availableSeats -= body.numberOfPeople || 0;
    trip.__v += 1;
    await trip.save();

    return {
      data: booking,
    };
  }

  async acceptBooking(user: User, bookingId: Types.ObjectId) {
    const bookingExist = await this.bookingModel.findById(bookingId);
    const trip = await this.tripModel.findOne({
      _id: bookingExist?.tripId,
    });
    if (!trip) throw new BadRequestException('unExpected error');
    if (!bookingExist) throw new BadRequestException('this booking is deleted');
    if (bookingExist?.status == StatusEnum.confirmed)
      throw new BadRequestException('this booking already confirmed');

    if (bookingExist.status == StatusEnum.canceled)
      throw new BadRequestException('this booking is canceled');

    bookingExist.status = StatusEnum.confirmed;
    bookingExist.__v += 1;
    await bookingExist.save();

    trip.availableSeats -= bookingExist.numberOfPeople;
    trip?.save();

    EmailEmitter.publish(Email_Events_Enum.CONFIRM_BOOKING, {
      to: user.email as string,
      subject: 'confirm your booking',
      html: confirmBookingTemplate({
        name: user.name as string,
        subject: 'your booking is confirmed',
      }),
    });

    return {
      data: 'booking confirmed successfully',
    };
  }

  async cancelBooking(user: User, bookingId: Types.ObjectId) {
    const bookingExist = await this.bookingModel.findById(bookingId);
    const trip = await this.tripModel.findOne({
      _id: bookingExist?.tripId,
    });
    if (!trip) throw new BadRequestException('this trip is deleted');
    if (!bookingExist) throw new BadRequestException('this booking is deleted');

    if (bookingExist.status == StatusEnum.canceled)
      throw new BadRequestException('this booking already canceled');

    if (bookingExist.status == StatusEnum.pending) {
      bookingExist.status = StatusEnum.canceled;
      bookingExist.__v += 1;
      await bookingExist.save();
    }
    if (bookingExist.status == StatusEnum.confirmed) {
      bookingExist.status = StatusEnum.canceled;
      bookingExist.__v += 1;
      await bookingExist.save();
      trip.availableSeats += bookingExist.numberOfPeople;
      await trip.save();
    }

    return {
      data: 'booking canceled successfully',
    };
  }
}
