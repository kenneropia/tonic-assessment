import User from "../models/User";
import argon2 from "argon2";

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password, {
    type: argon2.argon2id, // Most secure variant
    memoryCost: 2 ** 16, // 64 MiB
    timeCost: 3, // 3 iterations
    parallelism: 1, // 1 degree of parallelism
  });
};

export const verifyPassword = async (
  hashedPassword: string,
  candidatePassword: string
): Promise<boolean> => {
  return await argon2.verify(hashedPassword, candidatePassword);
};

export const generateAccountNumber = async (): Promise<string> => {
  let accountNumber: string;
  let existingUser;

  do {
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    accountNumber = timestamp + randomSuffix;

    // Check uniqueness
    existingUser = await User.findOne({ accountNumber });
  } while (existingUser);

  return accountNumber;
};

export const getUserById = async (userId: string) => {
  return User.findById(userId);
};

export const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

export const getUserByAccountNumber = async (accountNumber: string) => {
  return User.findOne({ accountNumber });
};
