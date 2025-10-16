import mongoose from "mongoose";
import dotenv from "dotenv";
import User, { IUser } from "../src/models/User";

dotenv.config();

async function addFunds(): Promise<void> {
  const args: string[] = process.argv.slice(2);

  if (
    args.length !== 2 ||
    !args[0] ||
    isNaN(Number(args[1])) ||
    Number(args[1]) <= 0
  ) {
    console.log("Usage: tsx scripts/add-funds.ts <accountNumber> <amount>");
    console.log("Example: tsx scripts/add-funds.ts 9657752951 1000");
    process.exit(1);
  }

  const [accountNumber, amountStr] = args;
  const amount: number = Number(amountStr);

  if (!accountNumber || isNaN(amount) || amount <= 0 || amount > 1000000) {
    console.error(
      "❌ Invalid inputs. Account number required, amount must be 1-1,000,000"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    const user = await User.findOne({ accountNumber });
    if (!user) {
      console.error(`❌ User with account number ${accountNumber} not found`);
      process.exit(1);
    }

    console.log(`📋 Found: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`💰 Current balance: ${user.balance}`);

    await User.updateOne(
      { accountNumber },
      {
        $set: {
          balance: mongoose.Types.Decimal128.fromString(amount.toString()),
        },
      }
    );

    console.log("✅ Funds updated successfully!");
    console.log(`💰 New balance: ${amount}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
  }
}

addFunds();
