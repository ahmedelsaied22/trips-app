/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import type { RedisClientType } from 'redis';
import { AuthReq } from '../guards/authGuard';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    if (req?.method != 'GET') {
      return next.handle();
    }
    const key = this.generateKey(req);
    const data = await this.redis.get(key);
    if (data) {
      console.log('data from cache');
      return of(JSON.parse(data));
    }
    return next.handle().pipe(
      tap(async (resData) => {
        console.log(resData);
        const value =
          typeof resData == 'string' ? resData : JSON.stringify(resData);
        if (!this.redis.isOpen) {
          this.redis.connect();
        }
        await this.redis.set(key, value, {
          expiration: {
            type: 'EX',
            value: 20,
          },
        });
        console.log('data saved to cache');
      }),
    );
  }

  generateKey(req: AuthReq) {
    const url: string = req.path;
    const userPart = req?.user?.email ? `:${req?.user?.email}` : '';
    const queryPart = Object.keys(req.query || {}).length
      ? `?${JSON.stringify(req.query)}`
      : '';
    const key = `http-cache:${req.method}:${url}:${queryPart}${userPart}`;
    return key;
  }
}
