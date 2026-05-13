/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { RequestBody } from './auth.controller';
import { User } from '../db/models/user.model';
import {
  Email_Events_Enum,
  EmailEmitter,
} from '../db/utils/email/email.events';
import { JWTService } from '../db/utils/security/token';
import { CompareHash, CreateHash } from '../db/utils/security/hash';
import { template } from '../db/utils/email/generateHtml';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JWTService,
  ) {}

  async signup(body: RequestBody) {
    const { data } = body;
    const { name, email, password, age, gender } = data;
    const user = await this.userModel.findOne({ email });
    if (user) {
      throw new BadRequestException('user already exist');
    }
    // creating otp
    const nanoid = customAlphabet('0123456789', 6);
    const otp = nanoid(6);

    const newUser = await this.userModel.create({
      name,
      email,
      password: await CreateHash(password),
      age,
      gender,
      otp: {
        otp: await CreateHash(otp),
        expiredAt: Date.now() + 1000 * 60,
      },
    });

    EmailEmitter.publish(Email_Events_Enum.VERIFY_EMAIL, {
      to: newUser.email,
      Subject: 'Verify your email',
      html: template({
        otp: otp,
        name: newUser.name as string,
        subject: 'Verify your eamil',
      }),
    });

    return {
      data: newUser,
    };
  }

  async confirmOTP(email: string, otp: string) {
    const emailExist = await this.userModel.findOne({ email });
    if (!emailExist) {
      throw new NotFoundException('user not found');
    }
    if (emailExist.isConfirmed == true) {
      throw new BadRequestException('email already confirmed');
    }

    if (new Date(emailExist.otp!.expiredAt) <= new Date(Date.now())) {
      throw new BadRequestException('in-valid OTP');
    }

    if (!(await CompareHash(otp, emailExist.otp?.otp as string))) {
      throw new BadRequestException('wrong OTP, try again later');
    }

    emailExist.isConfirmed = true;
    emailExist.save();

    return {
      data: 'Email confirmed successfully',
    };
  }

  async resendOTP(email: string) {
    const userExist = await this.userModel.findOne({ email });

    if (!userExist) throw new BadRequestException('user not found');

    if (userExist.isConfirmed == true)
      throw new BadRequestException('user already confirmed');

    const nanoid = customAlphabet('0123456789', 6);
    const otp = nanoid();

    await this.userModel.updateOne(
      { email },
      {
        otp: {
          otp: await CreateHash(otp),
          expiredAt: Date.now() + 1000 * 60,
        },
      },
    );
    EmailEmitter.publish(Email_Events_Enum.VERIFY_EMAIL, {
      to: email,
      subject: 'Verify your email',
      html: template({
        otp: otp,
        name: userExist.name as string,
        subject: 'Verify your email',
      }),
    });

    return {
      data: 'new OTP sent',
    };
  }

  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    const userExist = await this.userModel.findOne({ email });
    if (
      !userExist ||
      !(await CompareHash(password, userExist.password as string))
    )
      throw new BadRequestException('In-valid credintials');

    if (!userExist.isConfirmed)
      throw new BadRequestException('you have to confirm your email first');

    const accessToken = this.jwtService.sign({
      payload: { id: userExist._id, email: userExist.email },
      options: {
        secret: process.env.SECRET_ACCESS_TOKEN as string,
        expiresIn: '1 H',
      },
    });

    const refreshToken = this.jwtService.sign({
      payload: { id: userExist._id, name: userExist.name },
      options: {
        secret: process.env.SECRET_REFRESH_TOKEN as string,
        expiresIn: '7 D',
      },
    });
    userExist.refreshToken = refreshToken;
    userExist.save();

    return {
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshToken(token: string) {
    const payload: { id: Types.ObjectId; email: string } =
      await this.jwtService.verify({
        token,
        options: {
          secret: process.env.SECRET_REFRESH_TOKEN,
        },
      });

    const accessToken = this.jwtService.sign({
      payload: { id: payload.id, email: payload.email },
      options: {
        secret: process.env.SECRET_ACCESS_TOKEN as string,
      },
    });

    return {
      data: {
        accessToken,
      },
    };
  }

  async logout(user: User) {
    await this.userModel.updateOne(
      { email: user.email },
      {
        refreshToken: '',
        $inc: {
          __v: 1,
        },
      },
    );

    return {
      data: 'logged out successfully',
    };
  }
}
