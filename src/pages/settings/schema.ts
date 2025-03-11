import { z } from 'zod';

export const schema = z.object({
  currency: z.string().toUpperCase().refine(
    (currency) => currency.length === 3,
    { message: 'Invalid' },
  ).refine(
    (currency) => Intl.supportedValuesOf('currency').includes(currency),
    { message: 'Unsupported' },
  ),
  gstPercent: z.number(),
  brokerageAutoFill: z.number().optional(),
});

export type Schema = z.infer<typeof schema>;

export const defaultValues = {
  currency: '',
};
