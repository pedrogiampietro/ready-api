import { User } from "../entities/User";
import * as userRepository from "../repositories/userRepository";

export const register = async (userData: Partial<User>) => {
  return await userRepository.create(userData);
};

export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  return await userRepository.findByCredentials(credentials);
};
