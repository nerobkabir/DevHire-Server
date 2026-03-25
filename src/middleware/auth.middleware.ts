import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload, Role } from "../types/auth.types";
import { env } from "../config/env";

// ── protect: verify JWT token 
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user      = decoded;
    next();
  } catch (err) {
    const message =
      err instanceof jwt.TokenExpiredError ? "Token has expired"  :
      err instanceof jwt.JsonWebTokenError ? "Invalid token"      :
      "Authentication failed";

    res.status(401).json({ success: false, message });
  }
};

// ── authorize: generic role guard 
export const authorize = (...roles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required: ${roles.join(" or ")}`,
      });
      return;
    }
    next();
  };

// ── Named role guards (cleaner in route files) 

/** Only ADMIN */
export const adminOnly = authorize(Role.ADMIN);

/** Only RECRUITER */
export const recruiterOnly = authorize(Role.RECRUITER);

/** RECRUITER or ADMIN */
export const recruiterOrAdmin = authorize(Role.RECRUITER, Role.ADMIN);

/** USER or RECRUITER (everyone except admin-specific routes) */
export const userOrRecruiter = authorize(Role.USER, Role.RECRUITER);

/** Any authenticated user (all 3 roles) */
export const anyRole = authorize(Role.USER, Role.RECRUITER, Role.ADMIN);