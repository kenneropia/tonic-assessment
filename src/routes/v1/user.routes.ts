import { Router } from "express";
import { getProfile } from "../../controllers/user.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/profile", getProfile);

export default router;
