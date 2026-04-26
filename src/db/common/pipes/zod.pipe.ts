/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodObject) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    const result = await this.schema.safeParseAsync(value);
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }
    return result;
  }
}
