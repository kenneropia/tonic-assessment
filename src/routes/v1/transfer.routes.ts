import { Router } from "express";
import {
  transferFunds,
  getTransactionHistory,
} from "../../controllers/transfer.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { transferLimiter } from "../../middlewares/rateLimiter.middleware";
import { UserRole } from "../../models/User";
import Transaction from "../../models/Transaction";
import { validate } from "../../utils/validation";
import { transferSchema } from "../../utils/validation";

const router = Router();

router.use(authenticate);

router.use(transferLimiter);

router.post("/", validate(transferSchema), transferFunds);
router.get("/history", getTransactionHistory);

router.get("/all", authorize([UserRole.ADMIN]), async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName accountNumber")
      .populate("receiver", "firstName lastName accountNumber");

    res.status(200).json({
      message: "All transactions retrieved successfully",
      transactions,
    });
  } catch (error) {
    console.error("Get all transactions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
