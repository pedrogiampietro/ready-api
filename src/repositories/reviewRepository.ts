import { PrismaClient, Review } from "@prisma/client";

const prisma = new PrismaClient();

export const create = async (reviewData: Partial<Review>) => {
  return await prisma.review.create({ data: reviewData });
};

export const findById = async (id: number) => {
  return await prisma.review.findUnique({ where: { id } });
};
