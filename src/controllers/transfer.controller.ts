import { Request, Response } from "express";
import mongoose from "mongoose";
import { Decimal } from "decimal.js";
import User from "../models/User";
import Transaction, {
  TransactionType,
  TransactionStatus,
} from "../models/Transaction";
import { v4 as uuidv4 } from "uuid";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const transferFunds = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      receiverAccountNumber,
      amount,
      description,
      idempotencyKey = uuidv4(),
    } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check for existing transaction with the same idempotency key
    const existingTransaction = await Transaction.findOne({ idempotencyKey });
    if (existingTransaction) {
      // Return the same response for the same idempotency key
      return res.status(200).json({
        message: "Transfer already processed",
        transaction: {
          id: existingTransaction._id,
          amount: existingTransaction.amount,
          reference: existingTransaction.reference,
          receiverAccountNumber,
          date: existingTransaction._id.getTimestamp(),
          status: existingTransaction.status,
        },
      });
    }

    // Convert amount to Decimal for precise calculations
    const decimalAmount = new Decimal(amount);

    // Find sender with pessimistic locking (using findOneAndUpdate with lock)
    // MongoDB ensures only one operation can modify a document at a time within a transaction
    const sender = await User.findOneAndUpdate(
      { _id: senderId },
      { $set: { lastAccessed: new Date() } }, // Dummy update to acquire lock
      { new: true, session, runValidators: false }
    );

    if (!sender) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Sender not found" });
    }

    // Check if sender has sufficient balance
    const senderBalance = new Decimal(sender.balance.toString());
    if (senderBalance.lessThan(decimalAmount)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Find receiver with pessimistic locking
    // MongoDB ensures only one operation can modify a document at a time within a transaction

    const receiver = await User.findOneAndUpdate(
      { accountNumber: receiverAccountNumber },
      { $set: { lastAccessed: new Date() } }, // Dummy update to acquire lock
      { new: true, session, runValidators: false }
    );

    if (!receiver) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Receiver not found" });
    }

    const reference = `TRF-${Date.now()}-${Math.floor(
      Math.random() * 1000000
    )}`;

    // Create transaction with idempotency key
    const transaction = new Transaction({
      sender: sender._id,
      receiver: receiver._id,
      amount: mongoose.Types.Decimal128.fromString(decimalAmount.toString()),
      type: TransactionType.TRANSFER,
      status: TransactionStatus.PENDING,
      reference,
      idempotencyKey,
    });

    // Update balances using Decimal for precise calculations
    const receiverBalance = new Decimal(receiver.balance.toString());

    await User.updateOne(
      { _id: sender._id },
      {
        $set: {
          balance: mongoose.Types.Decimal128.fromString(
            senderBalance.minus(decimalAmount).toString()
          ),
        },
      },
      { session }
    );

    await User.updateOne(
      { _id: receiver._id },
      {
        $set: {
          balance: mongoose.Types.Decimal128.fromString(
            receiverBalance.plus(decimalAmount).toString()
          ),
        },
      },
      { session }
    );

    await transaction.save({ session });

    transaction.status = TransactionStatus.COMPLETED;
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    const transactionDate = transaction._id.getTimestamp();

    res.status(200).json({
      message: "Transfer successful",
      transaction: {
        id: transaction._id,
        amount: decimalAmount.toString(),
        reference,
        receiverAccountNumber,
        date: transactionDate,
        idempotencyKey,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transfer error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTransactionHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName accountNumber")
      .populate("receiver", "firstName lastName accountNumber");

    res.status(200).json({
      message: "Transaction history retrieved successfully",
      transactions,
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
