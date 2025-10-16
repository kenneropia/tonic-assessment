import jwt, { SignOptions } from "jsonwebtoken";
import { redisClient } from "../config/database";

export interface TokenPayload {
  userId: string;
  role: string;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || "access_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } as SignOptions
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" } as SignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || "access_secret"
  ) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || "refresh_secret"
  ) as TokenPayload;
};

export const storeRefreshToken = async (
  userId: string,
  refreshToken: string
): Promise<void> => {
  let expiryInSeconds = 7 * 24 * 60 * 60; // Default 7 days
  const refreshExpiry = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  if (refreshExpiry.endsWith("d")) {
    expiryInSeconds = parseInt(refreshExpiry) * 24 * 60 * 60;
  } else if (refreshExpiry.endsWith("h")) {
    expiryInSeconds = parseInt(refreshExpiry) * 60 * 60;
  } else if (refreshExpiry.endsWith("m")) {
    expiryInSeconds = parseInt(refreshExpiry) * 60;
  } else if (refreshExpiry.endsWith("s")) {
    expiryInSeconds = parseInt(refreshExpiry);
  }

  await redisClient.set(`refresh_token:${userId}`, refreshToken, {
    EX: expiryInSeconds,
  });
};

export const getStoredRefreshToken = async (
  userId: string
): Promise<string | null> => {
  return await redisClient.get(`refresh_token:${userId}`);
};

export const deleteRefreshToken = async (userId: string): Promise<void> => {
  await redisClient.del(`refresh_token:${userId}`);
};
