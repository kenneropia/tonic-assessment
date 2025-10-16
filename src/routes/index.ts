import { Router } from "express";
import v1AuthRoutes from "./v1/auth.routes";
import v1TransferRoutes from "./v1/transfer.routes";
import v1UserRoutes from "./v1/user.routes";

const router = Router();

router.use("/v1/auth", v1AuthRoutes);
router.use("/v1/transfers", v1TransferRoutes);
router.use("/v1/user", v1UserRoutes);

export default router;
