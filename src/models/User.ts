import mongoose, { Document, Schema } from "mongoose";
import argon2 from "argon2";

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accountNumber: string;
  balance: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    balance: {
      type: Schema.Types.Decimal128,
      default: 0,
      get: (v: any) => (v ? parseFloat(v.toString()) : 0),
      validate: {
        validator: function (v: any) {
          return parseFloat(v.toString()) >= 0;
        },
        message: "Balance cannot be negative",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
