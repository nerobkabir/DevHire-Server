import { Request } from "express";
import { Document, Types } from "mongoose";

// ── Roles ─────────────────────────────────────────────────────────────────────
export enum Role {
  USER      = "USER",       // Developer — can view & apply for jobs
  RECRUITER = "RECRUITER",  // Company/HR — can post & manage jobs
  ADMIN     = "ADMIN",      // Full access — manages everything
}

// Roles allowed during public registration (ADMIN is excluded)
export const PUBLIC_ROLES: Role[] = [Role.USER, Role.RECRUITER];

// ── User interfaces ───────────────────────────────────────────────────────────
export interface IUser {
  name:      string;
  email:     string;
  password:  string;
  role:      Role;
  isActive:  boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface RegisterDTO {
  name:     string;
  email:    string;
  password: string;
  role?:    Role.USER | Role.RECRUITER;  // ADMIN not allowed publicly
}

export interface LoginDTO {
  email:    string;
  password: string;
}

export interface AuthResponse {
  user: {
    id:    string;
    name:  string;
    email: string;
    role:  Role;
  };
  accessToken: string;
}

// ── JWT ───────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email:  string;
  role:   Role;
  iat?:   number;
  exp?:   number;
}

// ── Extended Request ──────────────────────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: JwtPayload;
}