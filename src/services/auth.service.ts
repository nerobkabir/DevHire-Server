import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import {
  RegisterDTO,
  LoginDTO,
  AuthResponse,
  JwtPayload,
  Role,
} from "../types/auth.types";
import { env } from "../config/env";

// ── Helpers 
const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

const buildAuthResponse = (
  user: { id: string; name: string; email: string; role: Role },
  token: string
): AuthResponse => ({
  user:        { id: user.id, name: user.name, email: user.email, role: user.role },
  accessToken: token,
});

// ── Service
export class AuthService {

  // ── Register
  async register(dto: RegisterDTO): Promise<AuthResponse> {
    // Block ADMIN role from public registration
    if ((dto.role as string) === Role.ADMIN) {
      throw Object.assign(
        new Error("ADMIN role cannot be assigned during registration"),
        { statusCode: 403 }
      );
    }

    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
    }

    const user = await User.create({
      name:     dto.name.trim(),
      email:    dto.email.toLowerCase().trim(),
      password: dto.password,
      role:     dto.role ?? Role.USER,
    });

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
    };

    return buildAuthResponse(
      { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      signToken(payload)
    );
  }

  // ── Login 
  async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await User.findByEmail(dto.email);

    if (!user) {
      throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
    }

    if (!user.isActive) {
      throw Object.assign(new Error("Account is deactivated"), { statusCode: 403 });
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
    };

    return buildAuthResponse(
      { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      signToken(payload)
    );
  }

  // ── Get profile 
  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    return user;
  }

  // ── Admin: change user role 
  async changeRole(userId: string, newRole: Role) {
    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    return user;
  }
}

export const authService = new AuthService();