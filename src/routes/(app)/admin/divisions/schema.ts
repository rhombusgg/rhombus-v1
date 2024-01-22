import { z } from 'zod';

export const formSchema = z.object({
	name: z.string().min(2).max(50),
	info: z.string().min(2).max(200),
	regex: z.string().min(2).max(200),
	existingDivisionId: z.string().optional()
});

export type FormSchema = typeof formSchema;
