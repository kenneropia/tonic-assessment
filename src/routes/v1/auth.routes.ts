import { Router } from "express";
import {
  signup,
  signin,
  refreshToken,
  signout,
} from "../../controllers/auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authLimiter } from "../../middlewares/rateLimiter.middleware";
import { validate } from "../../utils/validation";
import {
  signupSchema,
  signinSchema,
  refreshTokenSchema,
} from "../../utils/validation";

const router = Router();

router.use(authLimiter);

router.post("/signup", validate(signupSchema), signup);
router.post("/signin", validate(signinSchema), signin);
router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);
router.post("/signout", authenticate, signout);

export default router;
