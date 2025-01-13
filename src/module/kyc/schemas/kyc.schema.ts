import { z } from 'zod';

export const submitKycSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  documentType: z.enum(['PASSPORT', 'DRIVING_LICENSE', 'ID_CARD']),
});

export const updateKycSchema = submitKycSchema.partial();

export type SubmitKycDto = z.infer<typeof submitKycSchema>;
export type UpdateKycDto = z.infer<typeof updateKycSchema>;
