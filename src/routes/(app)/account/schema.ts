import { z } from 'zod';

export const newEmailSchema = z.object({
	email: z.string().email()
});

export type NewEmailSchema = typeof newEmailSchema;
