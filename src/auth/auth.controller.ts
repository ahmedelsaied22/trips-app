/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodPipe } from 'src/db/common/pipes/zod.pipe';
import { SignupSchema } from './validation/signup.validation';
import { AuthGuard, type AuthReq } from 'src/db/common/guards/authGuard';
export interface RequestBody {
  success: boolean;
  data: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ZodPipe(SignupSchema))
  async signup(@Body() body: RequestBody) {
    return this.authService.signup(body);
  }

  @Post('confirm-otp')
  async confirmOTP(@Body() { email, otp }: { email: string; otp: string }) {
    return await this.authService.confirmOTP(email, otp);
  }

  @Post('resend-otp')
  async resendOTP(@Body() { email }: { email: string }) {
    return await this.authService.resendOTP(email);
  }

  @Post('login')
  async login(
    @Body() { email, password }: { email: string; password: string },
  ) {
    return await this.authService.login({ email, password });
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: AuthReq) {
    const refreshToken = req.body!['refreshToken'];
    if (!refreshToken.startsWith(process.env.BEARER))
      throw new BadRequestException('invalid token');
    const token = refreshToken.split(' ')[1];

    return await this.authService.refreshToken(token);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: AuthReq) {
    const user = req.user;
    return await this.authService.logout(user);
  }
}
