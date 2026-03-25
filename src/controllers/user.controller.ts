import { Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { AuthRequest, Role } from "../types/auth.types";
import { UpdateProfileDTO, ChangeRoleDTO, UserQuery } from "../types/user.types";

export class UserController {

  // ── GET /users  (admin only)
  getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await userService.getAllUsers(req.query as UserQuery);
      res.status(200).json({ success: true, message: "Users fetched successfully", ...result });
    } catch (err) { next(err); }
  };

  // ── GET /users/:id  (own or admin)
  getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAdmin     = req.user!.role === Role.ADMIN;
      const requesterId = req.user!.userId;
      const targetId    = req.params.id;

      // Non-admin can only view their own profile
      if (!isAdmin && requesterId !== targetId) {
        res.status(403).json({ success: false, message: "You can only view your own profile" });
        return;
      }

      const user = await userService.getUserById(targetId);
      res.status(200).json({ success: true, data: { user } });
    } catch (err) { next(err); }
  };

  // ── PATCH /users/:id  (own or admin) 
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: UpdateProfileDTO = req.body;
      const isAdmin               = req.user!.role === Role.ADMIN;

      const user = await userService.updateProfile(
        req.params.id,
        dto,
        req.user!.userId,
        isAdmin
      );

      res.status(200).json({ success: true, message: "Profile updated successfully", data: { user } });
    } catch (err) { next(err); }
  };

  // ── DELETE /users/:id  (admin only)
  deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await userService.deleteUser(req.params.id);
      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) { next(err); }
  };

  // ── PATCH /users/:id/role  (admin only)
  changeRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: ChangeRoleDTO = req.body;
      const user = await userService.changeRole(req.params.id, dto);
      res.status(200).json({ success: true, message: "Role updated successfully", data: { user } });
    } catch (err) { next(err); }
  };
}

export const userController = new UserController();