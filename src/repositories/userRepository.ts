import { PrismaClient, User } from "@prisma/client";
import { generateJwt, generateRefreshJwt } from "../utils/jwtHelper";
import { addMinutes } from "date-fns";
import bcrypt from "bcrypt";
import { getSignedUrlForKey } from "../utils";

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
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      plan: {
        connect: { id: "free-plan-id" },
      },
    },
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

  const bucketUrl = user.avatar_url
    ? await getSignedUrlForKey(user.avatar_url)
    : null;

  const token = generateJwt({ id: user.id });
  const refreshToken = generateRefreshJwt({
    id: user.id,
  });

  const totalTrips = await prisma.trip.count({
    where: { userId: user.id },
  });

  return {
    success: true,
    message: "Login realizado com sucesso!",
    data: {
      ...user,
      bucket_url: bucketUrl,
      totalTrips,
    },
    token,
    refreshToken,
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

export const getUserPlan = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { plan: true },
  });

  return user?.plan;
};

export const findByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const setResetPasswordCode = async (user: User) => {
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = await bcrypt.hash(resetCode, 10);

  await prisma.user.update({
    where: { email: user.email },
    data: {
      resetPasswordToken: hashedCode,
      resetPasswordExpiresAt: addMinutes(new Date(), 10),
    },
  });

  return resetCode;
};

export const verifyResetPasswordCode = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.resetPasswordToken || !user.resetPasswordExpiresAt) {
    return false;
  }

  const isCodeValid = await bcrypt.compare(code, user.resetPasswordToken);

  if (!isCodeValid || user.resetPasswordExpiresAt < new Date()) {
    return false;
  }

  return user;
};

export const updatePassword = async (email: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    },
  });
};

export const createOrFindGoogleUser = async (userData: {
  email: string;
  googleId: string;
  name: string;
  avatarUrl: string;
}) => {
  let user = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userData.email,
        googleId: userData.googleId,
        password: "generated-by-google",
        name: userData.name,
        avatar_url: userData.avatarUrl,
        bucket_url: userData.avatarUrl,
        plan: {
          connect: { id: "free-plan-id" },
        },
      },
    });

    return {
      success: true,
      message: "Usuário criado com sucesso.",
      data: user,
    };
  }

  return {
    success: true,
    message: "Usuário encontrado com sucesso.",
    data: user,
  };
};
