import { User } from "@prisma/client";
import * as userRepository from "../repositories/userRepository";
import { sendEmail } from "../utils/nodemailer";

export const register = async (userData: User) => {
  return await userRepository.create(userData);
};

export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  return await userRepository.findByCredentials(credentials);
};

export const updateProfile = async (
  userId: string,
  updateData: Partial<User>
) => {
  return await userRepository.update(userId, updateData);
};

export const getUserById = async (userId: string) => {
  return await userRepository.findById(userId);
};

export const forgotPassword = async (email: string) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const resetCode = await userRepository.setResetPasswordCode(user);

  await sendEmail(
    email,
    "Recuperação de Senha",
    `Use este código para redefinir sua senha: ${resetCode}`
  );

  return {
    success: true,
    message: "Código de recuperação de senha enviado com sucesso.",
  };
};

export const verifyResetPasswordCode = async (email: string, code: string) => {
  const user = await userRepository.verifyResetPasswordCode(email, code);
  if (!user) {
    throw new Error("Código inválido ou expirado.");
  }

  return {
    success: true,
    message: "Código verificado com sucesso.",
  };
};

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  const user = await userRepository.verifyResetPasswordCode(email, code);
  if (!user) {
    throw new Error("Código inválido ou expirado.");
  }

  await userRepository.updatePassword(email, newPassword);

  return {
    success: true,
    message: "Senha redefinida com sucesso.",
  };
};
