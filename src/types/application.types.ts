import { Document, Types } from "mongoose";

// ── Enums 
export enum ApplicationStatus {
  PENDING   = "PENDING",
  REVIEWED  = "REVIEWED",
  SHORTLIST = "SHORTLISTED",
  REJECTED  = "REJECTED",
  HIRED     = "HIRED",
}

// ── Interface 
export interface IApplication {
  jobId:        Types.ObjectId;
  applicantId:  Types.ObjectId;
  coverLetter?: string;
  status:       ApplicationStatus;
  createdAt:    Date;
  updatedAt:    Date;
}

export interface IApplicationDocument extends IApplication, Document {
  _id: Types.ObjectId;
}

// ── DTOs 
export interface CreateApplicationDTO {
  jobId:        string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusDTO {
  status: ApplicationStatus;
}

export interface ApplicationQuery {
  page?:   string;
  limit?:  string;
  status?: ApplicationStatus;
}