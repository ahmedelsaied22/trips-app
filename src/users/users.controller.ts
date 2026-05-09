import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard, type AuthReq } from 'src/db/common/guards/authGuard';
import { AdminGuard } from 'src/db/common/guards/adminGuard';
import { Types } from 'mongoose';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  profile(@Req() req: AuthReq) {
    const user = req.user;
    return {
      data: user,
    };
  }

  @Patch('update-user')
  @UseGuards(AuthGuard)
  async updateUser(
    @Req() req: AuthReq,
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      age: number;
      gender: string;
    },
  ) {
    const user = req.user;
    const { name, email, password, age, gender } = body;

    return await this.userService.updateUser(user, {
      name,
      email,
      password,
      age,
      gender,
    });
  }

  @Get('all')
  async allUsers() {
    return await this.userService.allUsers();
  }

  @Delete('delete-user/:userId')
  @UseGuards(AuthGuard, AdminGuard)
  async deleteUser(@Param('userId') userId: Types.ObjectId) {
    // console.log(userId);
    return await this.userService.deleteUser(userId);
  }
}
