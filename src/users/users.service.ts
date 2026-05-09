import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/db/models/user.model';
import { CompareHash } from 'src/db/utils/security/hash';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async updateUser(
    user: Partial<User>,
    data: {
      name: string;
      email: string;
      password: string;
      age: number;
      gender: string;
    },
  ) {
    if (user.email != data.email && data.email != '') {
      throw new BadRequestException('you can`t change your email');
    }

    if (
      !(await CompareHash(data.password, user.password as string)) &&
      data.password != ''
    ) {
      throw new BadRequestException('In-valid credintials');
    }

    user.name = data.name || user.name;
    user.age = data.age || user.age;
    user.gender = data.gender || user.gender;
    await this.userModel.updateOne(
      { email: user.email },
      {
        name: data.name || user.name,
        age: data.age || user.age,
        gender: data.gender || user.gender,
        $inc: {
          __v: 1,
        },
      },
    );

    return {
      data: 'user updated successfully',
    };
  }

  async allUsers() {
    const users = await this.userModel.find({});
    return {
      data: users,
    };
  }

  async deleteUser(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('user already deleted');
    }
    await user.deleteOne();

    return {
      data: 'user deleted successfully',
    };
  }
}
