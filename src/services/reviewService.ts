import { Review } from "../entities/Review";
import * as reviewRepository from "../repositories/reviewRepository";

export const createReview = async (reviewData: Partial<Review>) => {
  return await reviewRepository.create(reviewData);
};

export const getReview = async (id: number) => {
  return await reviewRepository.findById(id);
};
