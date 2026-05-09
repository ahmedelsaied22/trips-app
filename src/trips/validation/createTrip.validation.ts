import z from 'zod';

export const TripSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  location: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  availableSeats: z.number().min(0),
  image: z.object(),
});
