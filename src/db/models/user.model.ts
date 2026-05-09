import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
}

export enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    required: true,
  })
  name?: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email?: string;

  @Prop({
    type: String,
    required: true,
  })
  password?: string;

  @Prop({
    type: Number,
    min: 18,
    max: 60,
  })
  age?: number;

  @Prop({
    type: String,
    default: GenderEnum.MALE,
  })
  gender?: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isConfirmed?: boolean;

  @Prop({
    type: [Types.ObjectId],
  })
  favorites?: [Types.ObjectId];

  @Prop({
    type: String,
    default: RoleEnum.USER,
  })
  role?: RoleEnum;

  @Prop({
    type: {
      otp: String,
      expiredAt: Date,
    },
  })
  otp?: {
    otp: string;
    expiredAt: Date;
  };

  @Prop({
    type: String,
    default: '',
  })
  refreshToken?: string;
}

export type UserDocument = HydratedDocument<User>;

export const userShcema = SchemaFactory.createForClass(User);

export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: userShcema,
  },
]);
