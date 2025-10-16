import { Request, Response } from "express";
import User, { UserRole } from "../models/User";
import {
  generateTokens,
  verifyRefreshToken,
  storeRefreshToken,
  getStoredRefreshToken,
  deleteRefreshToken,
} from "../utils/jwt";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  generateAccountNumber,
  hashPassword,
  verifyPassword,
} from "../services/user.service";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const accountNumber = await generateAccountNumber();

    const hashedPassword = await hashPassword(password);

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      accountNumber,
      role: role || UserRole.CUSTOMER,
    });

    await user.save();

    const tokens = generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    await storeRefreshToken(user._id.toString(), tokens.refreshToken);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountNumber: user.accountNumber,
      },
      tokens,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("user user", user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await verifyPassword(user.password, password);
    console.log("password", password, isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokens = generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    await storeRefreshToken(user._id.toString(), tokens.refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountNumber: user.accountNumber,
      },
      tokens,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const storedToken = await getStoredRefreshToken(decoded.userId);

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const tokens = generateTokens({
      userId: decoded.userId,
      role: decoded.role,
    });

    await storeRefreshToken(decoded.userId, tokens.refreshToken);

    res.status(200).json({
      message: "Token refreshed successfully",
      tokens,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const signout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await deleteRefreshToken(req.user.userId);

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Signout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
