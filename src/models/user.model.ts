import { Schema, model, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUserDocument } from "../types/user.types";
import { Role } from "../types/auth.types";

interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: {
      type:      String,
      required:  [true, "Name is required"],
      trim:      true,
      minlength: [2,  "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },

    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      trim:      true,
      lowercase: true,
      match:     [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,
    },

    role: {
      type:    String,
      enum: {
        values:  Object.values(Role),
        message: `Role must be one of: ${Object.values(Role).join(", ")}`,
      },
      default: Role.USER,
    },

    // ── Extended profile fields 
    bio: {
      type:      String,
      trim:      true,
      maxlength: [500, "Bio must be at most 500 characters"],
    },

    skills: {
      type:    [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.every((s) => s.trim().length > 0),
        message:   "Each skill must be a non-empty string",
      },
    },

    github: {
      type:  String,
      trim:  true,
      match: [/^https?:\/\/(www\.)?github\.com\/.+/, "Please enter a valid GitHub URL"],
    },

    avatar: {
      type:  String,
      trim:  true,
      match: [/^https?:\/\/.+/, "Please enter a valid avatar URL"],
    },

    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
  ret.id = ret._id;
  delete ret._id;
  delete ret.password;
  return ret;
},
    },
  }
);

// ── Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Static 
userSchema.statics.findByEmail = function (
  email: string
): Promise<IUserDocument | null> {
  return this.findOne({ email: email.toLowerCase().trim() }).select("+password");
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role:  1 });

export const User = model<IUserDocument, IUserModel>("User", userSchema);