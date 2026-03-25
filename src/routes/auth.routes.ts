import { Router } from "express";
import { authController }                         from "../controllers/auth.controller";
import { protect, adminOnly }                     from "../middleware/auth.middleware";
import { registerRules, loginRules, validate }    from "../middleware/validate.middleware";

const router = Router();

// ── Public 
router.post("/register", registerRules, validate, authController.register);
router.post("/login",    loginRules,    validate, authController.login);

// ── Protected: any logged-in user
router.get("/me", protect, authController.getMe);

// ── Admin only: change any user's role 
router.patch("/role", protect, adminOnly, authController.changeRole);

export default router;