import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export const create = async (userData: Partial<User>) => {
  return await prisma.user.create({ data: userData });
};

export const findByCredentials = async (credentials: {
  email: string;
  password: string;
}) => {
  return await prisma.user.findFirst({ where: credentials });
};
