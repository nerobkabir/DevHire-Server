import { User } from "../models/user.model";
import {
  UpdateProfileDTO,
  ChangeRoleDTO,
  UserQuery,
  IUserDocument,
} from "../types/user.types";

export class UserService {

  // ── Get all users ─────────────────────────────────────────────────────────
  async getAllUsers(query: UserQuery) {
    const page  = Math.max(1, parseInt(query.page  ?? "1"));
    const limit = Math.min(50, parseInt(query.limit ?? "10"));
    const skip  = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.role) filter.role = query.role;

    if (query.search) {
      filter.$or = [
        { name:  { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Get single user ───────────────────────────────────────────────────────
  async getUserById(id: string): Promise<IUserDocument> {
    const user = await User.findById(id);
    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    return user;
  }

  // ── Update profile ────────────────────────────────────────────────────────
  async updateProfile(
    targetId:    string,
    dto:         UpdateProfileDTO,
    requesterId: string,
    isAdmin:     boolean
  ): Promise<IUserDocument> {
    // Permission check: only own profile or admin
    if (!isAdmin && targetId !== requesterId) {
      throw Object.assign(
        new Error("You can only update your own profile"),
        { statusCode: 403 }
      );
    }

    // Duplicate email check
    if (dto.email) {
      const existing = await User.findOne({
        email: dto.email.toLowerCase(),
        _id:   { $ne: targetId },
      });
      if (existing) {
        throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
      }
    }

    const updateData: Partial<UpdateProfileDTO> = {};
    if (dto.name   !== undefined) updateData.name   = dto.name.trim();
    if (dto.email  !== undefined) updateData.email  = dto.email.toLowerCase().trim();
    if (dto.bio    !== undefined) updateData.bio    = dto.bio.trim();
    if (dto.skills !== undefined) updateData.skills = dto.skills;
    if (dto.github !== undefined) updateData.github = dto.github.trim();
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar.trim();

    const user = await User.findByIdAndUpdate(targetId, updateData, {
      new:           true,
      runValidators: true,
    });

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    return user;
  }

  // ── Delete user ───────────────────────────────────────────────────────────
  async deleteUser(id: string): Promise<void> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
  }

  // ── Change role ───────────────────────────────────────────────────────────
  async changeRole(id: string, dto: ChangeRoleDTO): Promise<IUserDocument> {
    const user = await User.findByIdAndUpdate(
      id,
      { role: dto.role },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    return user;
  }
}

export const userService = new UserService();