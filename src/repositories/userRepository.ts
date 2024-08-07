import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";

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

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = await prisma.user.create({
    data: { ...userData, password: hashedPassword },
  });

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
  const user = await prisma.user.findFirst({
    where: { email: credentials.email },
  });

  if (!user) {
    return {
      success: false,
      message: "Nenhum usuário encontrado com este email.",
      data: null,
    };
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Senha inválida.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Login bem sucedido.",
    data: user,
  };
};

export const update = async (userId: string, updateData: any) => {
  try {
    const { userId: _, ...validData } = updateData;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validData,
    });

    return {
      success: true,
      message: "Perfil atualizado com sucesso.",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      success: false,
      message: "Erro ao atualizar perfil.",
      data: null,
    };
  }
};

export const findById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: "Usuário não encontrado.",
        data: null,
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      success: false,
      message: "Erro ao buscar usuário.",
      data: null,
    };
  }
};
