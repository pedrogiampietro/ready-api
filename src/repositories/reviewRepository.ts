import { PrismaClient, Review } from "@prisma/client";

const prisma = new PrismaClient();

export const create = async (reviewData: Review) => {
  return await prisma.review.create({ data: reviewData });
};

export const findById = async (id: string) => {
  return await prisma.review.findUnique({ where: { id } });
};
