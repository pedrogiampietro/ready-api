import { Trip } from "../entities/Trip";
import * as tripRepository from "../repositories/tripRepository";

// Passa os dados para o repositório

export const createTrip = async (tripData: Trip) => {
  return await tripRepository.create(tripData);
};

export const getTrip = async (id: string) => {
  return await tripRepository.findById(id);
};

export const getAllTrip = async () => {
  return await tripRepository.getAll();
};
