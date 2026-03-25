import { Response, NextFunction } from "express";
import { aiService }     from "../services/ai.service";
import { AuthRequest }   from "../types/auth.types";
import {
  ChatDTO,
  GenerateDescriptionDTO,
  ReviewSummaryDTO,
  ResumeAnalysisDTO,
  SearchAssistantDTO,
} from "../types/ai.types";

export class AiController {

  // POST /ai/chat
  chat = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ChatDTO = req.body;
      const result = await aiService.chat(dto);

      res.status(200).json({
        success: true,
        message: "Chat response generated",
        data:    result,
      });
    } catch (err) { next(err); }
  };

  //  POST /ai/search-assistant 
  searchAssistant = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: SearchAssistantDTO = req.body;
      const result = await aiService.searchAssistant(dto);

      res.status(200).json({
        success: true,
        message: "Search suggestions generated",
        data:    result,
      });
    } catch (err) { next(err); }
  };

  // POST /ai/generate-description 
  generateDescription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: GenerateDescriptionDTO = req.body;
      const result = await aiService.generateDescription(dto);

      res.status(200).json({
        success: true,
        message: "Job description generated successfully",
        data:    result,
      });
    } catch (err) { next(err); }
  };

  // POST /ai/review-summary
  summarizeReviews = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ReviewSummaryDTO = req.body;
      const result = await aiService.summarizeReviews(dto);

      res.status(200).json({
        success: true,
        message: "Review summary generated successfully",
        data:    result,
      });
    } catch (err) { next(err); }
  };

  // POST /ai/analyze-resume
  analyzeResume = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: ResumeAnalysisDTO = req.body;
      const result = await aiService.analyzeResume(dto);

      res.status(200).json({
        success: true,
        message: "Resume analyzed successfully",
        data:    result,
      });
    } catch (err) { next(err); }
  };
}

export const aiController = new AiController();