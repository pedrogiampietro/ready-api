import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export const create = async (userData: User) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Um usuário com este email já está registrado.",
      data: null,
    };
  }

  const newUser = await prisma.user.create({ data: userData });

  return {
    success: true,
    message: "Usuário criado com sucesso.",
    data: newUser,
  };
};

export const findByCredentials = async (credentials: {
  email: string;
  password: string;
}) => {
  return await prisma.user.findFirst({ where: credentials });
};
