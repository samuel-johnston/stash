import { z } from 'zod';

export const schema = z.object({
  accountId: z.string(),
  countries: z.string().array(),
  financialStatus: z.string().array(),
  miningStatus: z.string().array(),
  resources: z.string().array(),
  products: z.string().array(),
  recommendations: z.string().array(),
});

export type Schema = z.infer<typeof schema>;

export const defaultValues: Schema = {
  accountId: '',
  countries: [],
  financialStatus: [],
  miningStatus: [],
  resources: [],
  products: [],
  recommendations: [],
};
