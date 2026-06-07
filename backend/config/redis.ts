import { Redis } from 'ioredis';

const parsed = new URL(process.env.REDIS_URL!);

export const redisConfig = {
  host: parsed.hostname,
  port: Number(parsed.port),
  password: parsed.password,
};

export const redis = new Redis(redisConfig);
