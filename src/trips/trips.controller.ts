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
import { AuthGuard, type AuthReq } from 'src/db/common/guards/authGuard';
import { AdminGuard } from 'src/db/common/guards/adminGuard';
// import { ZodPipe } from 'src/db/common/pipes/zod.pipe';
// import { TripSchema } from './validation/createTrip.validation';
import { FilesInterceptor } from '@nestjs/platform-express';
import { uploadBufferToCloudinary } from 'src/db/utils/images/upload';
import { Types } from 'mongoose';
// import { Multer } from 'multer';

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
