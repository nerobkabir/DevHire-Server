import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest, RegisterDTO, LoginDTO, Role } from "../types/auth.types";

export class AuthController {

  // ── POST /auth/register ───────────────────────────────────────────────────
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: RegisterDTO = req.body;
      const result = await authService.register(dto);
      res.status(201).json({ success: true, message: "Registration successful", data: result });
    } catch (err) { next(err); }
  };

  // ── POST /auth/login ──────────────────────────────────────────────────────
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: LoginDTO = req.body;
      const result = await authService.login(dto);
      res.status(200).json({ success: true, message: "Login successful", data: result });
    } catch (err) { next(err); }
  };

  // ── GET /auth/me  (protected) ─────────────────────────────────────────────
  getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.status(200).json({ success: true, data: { user } });
    } catch (err) { next(err); }
  };

  // ── PATCH /auth/role  (ADMIN only) ────────────────────────────────────────
  changeRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, role } = req.body;

      if (!Object.values(Role).includes(role)) {
        res.status(422).json({ success: false, message: `Invalid role. Must be: ${Object.values(Role).join(", ")}` });
        return;
      }

      const user = await authService.changeRole(userId, role);
      res.status(200).json({ success: true, message: "Role updated successfully", data: { user } });
    } catch (err) { next(err); }
  };
}

export const authController = new AuthController();