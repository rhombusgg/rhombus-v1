import { z } from 'zod';

export const teamNameFormSchema = z.object({
	name: z.string().min(3).max(50)
});

export type TeamNameFormSchema = typeof teamNameFormSchema;
