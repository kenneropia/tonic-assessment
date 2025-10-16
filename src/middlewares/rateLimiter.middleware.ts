import rateLimit from "express-rate-limit";

const defaultOptions = {
  standardHeaders: true,
  legacyHeaders: false
};

export const apiLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later."
});

export const authLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many authentication attempts, please try again later."
});

export const transferLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: "Too many transfer attempts, please try again later."
});
