import { Document, Types } from "mongoose";
import { Role } from "./auth.types";

// ── User document 
export interface IUser {
  name:      string;
  email:     string;
  password:  string;
  role:      Role;
  bio?:      string;
  skills?:   string[];
  github?:   string;
  avatar?:   string;
  isActive:  boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

// ── DTOs 
export interface UpdateProfileDTO {
  name?:    string;
  email?:   string;
  bio?:     string;
  skills?:  string[];
  github?:  string;
  avatar?:  string;
}

export interface ChangeRoleDTO {
  role: Role;
}

export interface UserQuery {
  page?:   string;
  limit?:  string;
  search?: string;
  role?:   Role;
}