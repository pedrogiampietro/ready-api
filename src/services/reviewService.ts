import { Review } from "@prisma/client";
import * as reviewRepository from "../repositories/reviewRepository";

export const createReview = async (reviewData: Review) => {
  return await reviewRepository.create(reviewData);
};

export const getReview = async (id: string) => {
  return await reviewRepository.findById(id);
};
