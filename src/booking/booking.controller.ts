import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { AuthGuard, type AuthReq } from 'src/db/common/guards/authGuard';
import { Types } from 'mongoose';
import { AdminGuard } from 'src/db/common/guards/adminGuard';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create-booking/:tripId')
  @UseGuards(AuthGuard)
  async createBooking(
    @Req() req: AuthReq,
    @Body()
    body: {
      phone: string;
      numberOfPeople: number;
      notes: string;
    },
    @Param('tripId') tripId: Types.ObjectId,
  ) {
    const user = req.user;

    return await this.bookingService.createBooking(body, user, tripId);
  }

  @Patch('confirm-booking/:bookingId')
  @UseGuards(AuthGuard, AdminGuard)
  async acceptBooking(
    @Req() req: AuthReq,
    @Param('bookingId') bookingId: Types.ObjectId,
  ) {
    const user = req.user;
    return await this.bookingService.acceptBooking(user, bookingId);
  }

  @Patch('cancel-booking/:bookingId')
  @UseGuards(AuthGuard)
  async cancelBooking(
    @Req() req: AuthReq,
    @Param('bookingId') bookingId: Types.ObjectId,
  ) {
    const user = req.user;

    return await this.bookingService.cancelBooking(user, bookingId);
  }
}
