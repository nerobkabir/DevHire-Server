import { Router } from "express";
import { userController }                        from "../controllers/user.controller";
import { protect, adminOnly }                    from "../middleware/auth.middleware";
import { validate }                              from "../middleware/validate.middleware";
import {
  updateProfileRules,
  changeRoleRules,
  objectIdRule,
  getUsersQueryRules,
} from "../middleware/user.validate";

const router = Router();

// All routes require authentication
router.use(protect);

// ── GET  /users            → ADMIN only, with search & pagination
router.get(
  "/",
  adminOnly,
  getUsersQueryRules,
  validate,
  userController.getAllUsers
);

// ── GET  /users/:id        → own profile or ADMIN
router.get(
  "/:id",
  objectIdRule,
  validate,
  userController.getUserById
);

// ── PATCH /users/:id       → own profile or ADMIN
router.patch(
  "/:id",
  objectIdRule,
  updateProfileRules,
  validate,
  userController.updateProfile
);

// ── DELETE /users/:id      → ADMIN only
router.delete(
  "/:id",
  adminOnly,
  objectIdRule,
  validate,
  userController.deleteUser
);

// ── PATCH /users/:id/role  → ADMIN only
router.patch(
  "/:id/role",
  adminOnly,
  objectIdRule,
  changeRoleRules,
  validate,
  userController.changeRole
);

export default router;