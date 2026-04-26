import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { successHandler } from './db/common/interceptors/successHandler.interceptor';
// import { Email_Events_Enum, EmailEmitter } from './db/utils/email/email.events';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new successHandler());
  await app.listen(Number(process.env.PORT) || 3001);

  // EmailEmitter.publish(Email_Events_Enum.VERIFY_EMAIL, {
  //   to: 'maheressam665@gmail.com',
  //   Subject: 'verify your email',
  // });
}
bootstrap();
