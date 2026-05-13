/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  // UsePipes,
} from '@nestjs/common';

import { TripsService } from './trips.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { CacheInterceptor } from '../db/common/interceptors/cache.interceptor';
import { AuthGuard, type AuthReq } from '../db/common/guards/authGuard';
import { uploadBufferToCloudinary } from '../db/utils/images/upload';
import { AdminGuard } from '../db/common/guards/adminGuard';

// export interface TripsReq {
//   data: {
//     title: string;
//     description: string;
//     price: number;
//     location: string;
//     startDate: Date;
//     endDate: Date;
//     availableSeats: number;
//   };
// }
// export type TripsReq = z.infer<typeof TripSchema>;

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('create-trip')
  @UseGuards(AuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('images', 8))
  // @UsePipes(new ZodPipe(TripSchema))
  async createTrip(
    @Body()
    data: any,
    @Req() req: AuthReq,
    @UploadedFiles() files: any,
  ) {
    const user = req.user;

    const images: {}[] = [];
    await Promise.all(
      files.map(
        async (file: {
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          buffer: Buffer;
          size: number;
        }) => {
          const image = await uploadBufferToCloudinary(file.buffer);
          images.push(image);
        },
      ),
    );
    data.images = images;

    return await this.tripsService.createTrip({
      data,
      user,
      images: data.images,
    });
  }

  @Get('')
  @UseInterceptors(CacheInterceptor)
  async getAllTrips() {
    return await this.tripsService.getAllTrips();
  }

  @Patch('update-trip/:tripId')
  @UseGuards(AuthGuard, AdminGuard)
  // @UsePipes(new ZodPipe(TripSchema))
  @UseInterceptors(FilesInterceptor('images', 8))
  async updateTrip(
    @Body()
    body: {
      title: string;
      description: string;
      price: number;
      location: string;
      startDate: Date;
      endDate: Date;
      availableSeats: number;
      images: [];
    },
    @Req() req: AuthReq,
    @Param('tripId') tripId: Types.ObjectId,
    @UploadedFiles() files: [],
  ) {
    const newData = body;
    newData.images = files;

    return await this.tripsService.updateTrip(tripId, newData);
  }

  @Delete('delete-trip/:tripId')
  @UseGuards(AuthGuard, AdminGuard)
  async deleteTrip(@Param('tripId') tripId: Types.ObjectId) {
    return await this.tripsService.deleteTrip(tripId);
  }
}
