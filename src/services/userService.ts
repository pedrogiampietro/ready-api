import { User } from "@prisma/client";
import * as userRepository from "../repositories/userRepository";

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
