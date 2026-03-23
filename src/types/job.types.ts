import { Document, Types } from "mongoose";

// ── Enums ─────────────────────────────────────────────────────────────────────
export enum JobStatus {
  OPEN   = "OPEN",
  CLOSED = "CLOSED",
}

export enum JobCategory {
  FRONTEND  = "Frontend",
  BACKEND   = "Backend",
  FULLSTACK = "Fullstack",
  DEVOPS    = "DevOps",
  MOBILE    = "Mobile",
  DATA      = "Data",
  AI_ML     = "AI/ML",
  QA        = "QA",
  DESIGN    = "Design",
  OTHER     = "Other",
}

export enum JobType {
  FULL_TIME  = "Full-time",
  PART_TIME  = "Part-time",
  CONTRACT   = "Contract",
  REMOTE     = "Remote",
  INTERNSHIP = "Internship",
}

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface IJob {
  title:          string;
  description:    string;
  company:        string;
  salary:         number;
  location:       string;
  category:       JobCategory;
  jobType:        JobType;
  requiredSkills: string[];
  status:         JobStatus;
  createdBy:      Types.ObjectId;
  createdAt:      Date;
  updatedAt:      Date;
}

export interface IJobDocument extends IJob, Document {
  _id: Types.ObjectId;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface CreateJobDTO {
  title:          string;
  description:    string;
  company:        string;
  salary:         number;
  location:       string;
  category:       JobCategory;
  jobType?:       JobType;
  requiredSkills: string[];
}

export interface UpdateJobDTO {
  title?:          string;
  description?:    string;
  company?:        string;
  salary?:         number;
  location?:       string;
  category?:       JobCategory;
  jobType?:        JobType;
  requiredSkills?: string[];
  status?:         JobStatus;
}

export interface JobQuery {
  search?:    string;
  category?:  string;
  location?:  string;
  jobType?:   string;
  salaryMin?: string;
  salaryMax?: string;
  sort?:      string;
  page?:      string;
  limit?:     string;
}