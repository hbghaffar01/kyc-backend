import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform((val) => {
    const num = Number(val);
    if (isNaN(num)) {
      throw new Error(`Invalid PORT value: ${val}`);
    }
    return num;
  }),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
});

export const validateConfig = (config: Record<string, unknown>) => {
  try {
    return envSchema.parse(config);
  } catch (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }
};
