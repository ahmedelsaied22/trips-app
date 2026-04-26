/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JWTService {
  constructor(private readonly Jwt: JwtService) {}

  sign({ payload, options = {} }: { payload: any; options?: JwtSignOptions }) {
    const token = this.Jwt.sign(payload, options);
    return token;
  }

  verify({ token, options }: { token: string; options: JwtVerifyOptions }) {
    const result = this.Jwt.verify(token, options);
    return result;
  }
}
