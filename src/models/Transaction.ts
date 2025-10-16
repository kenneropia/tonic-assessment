import mongoose, { Document, Schema } from "mongoose";
import { Decimal128 } from "mongodb";

export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
  TRANSFER = "transfer",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId;
  amount: Decimal128;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Schema.Types.Decimal128,
      required: true,
      validate: {
        validator: function (value: Decimal128) {
          return parseFloat(value.toString()) > 0;
        },
        message: "Amount must be greater than 0",
      },
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    idempotencyKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
