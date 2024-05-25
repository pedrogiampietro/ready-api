import { Request, Response } from "express";
import * as reviewService from "../../services/reviewService";

export const createReview = async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.body);
  res.json(review);
};

export const getReview = async (req: Request, res: Response) => {
  const review = await reviewService.getReview(req.params.id);
  res.json(review);
};
