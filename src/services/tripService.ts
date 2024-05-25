import { Trip } from "../entities/Trip";
import * as tripRepository from "../repositories/tripRepository";

export const createTrip = async (tripData: Partial<Trip>) => {
  return await tripRepository.create(tripData);
};

export const getTrip = async (id: number) => {
  return await tripRepository.findById(id);
};
