import { PrismaClient, Trip } from "@prisma/client";

const prisma = new PrismaClient();

export const create = async (tripData: Trip) => {
  return await prisma.trip.create({ data: tripData });
};

export const findById = async (id: string) => {
  return await prisma.trip.findUnique({ where: { id } });
};
