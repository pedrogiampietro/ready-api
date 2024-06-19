import * as tripRepository from "../repositories/tripRepository";
import { FrontendTrip } from "../repositories/tripRepository";

export const createTrip = async (tripData: FrontendTrip) => {
  return await tripRepository.create(tripData);
};

export const getTrip = async (id: string) => {
  return await tripRepository.findById(id);
};

export const getAllTrip = async () => {
  return await tripRepository.getAll();
};

export const getAllTripsByUserId = async (userId: string) => {
  return await tripRepository.getAllTripsByUserId(userId);
};

export const createTripByIA = async (tripData: any) => {
  try {
    // console.log("Dados recebidos no serviço:", tripData);

    const newTrip = await tripRepository.createByIA({
      ...tripData,
    });

    // console.log("Viagem criada no banco de dados:", newTrip);

    return newTrip;
  } catch (error) {
    console.error("Error creating trip: ", error);
    throw new Error("An error occurred while creating the trip.");
  }
};

export const updateTrip = async (tripId: string, tripData: FrontendTrip) => {
  return await tripRepository.update(tripId, tripData);
};
