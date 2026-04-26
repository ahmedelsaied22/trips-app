import { GenderEnum } from 'src/db/models/user.model';
import z from 'zod';

export const SignupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(8),
  age: z.number().positive().min(18).max(80),
  gender: z.enum(GenderEnum),
});
