import EventEmitter from 'events';
import { SendEmail } from './send.email';

export enum Email_Events_Enum {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export class EmailEvents {
  constructor(private readonly emitter: EventEmitter) {}

  subscribe = (event: Email_Events_Enum, callback: (payload: any) => void) => {
    this.emitter.on(event, callback);
  };

  publish = (event: Email_Events_Enum, payload: any) => {
    this.emitter.emit(event, payload);
  };
}

const emitter = new EventEmitter();
export const EmailEmitter = new EmailEvents(emitter);

EmailEmitter.subscribe(
  Email_Events_Enum.VERIFY_EMAIL,
  ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    SendEmail({ to, subject, html });
  },
);

EmailEmitter.subscribe(
  Email_Events_Enum.RESET_PASSWORD,
  ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    SendEmail({ to, subject, html });
  },
);
