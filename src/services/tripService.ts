import * as tripRepository from "../repositories/tripRepository";
import { FrontendTrip } from "../repositories/tripRepository";
import { getUserPlan } from "../repositories/userRepository";

export const createTrip = async (tripData: FrontendTrip) => {
  const isCanCreateTrip = await canCreateTrip(tripData.userId);

  if (!isCanCreateTrip) {
    throw new Error(
      "Você atingiu o número máximo de viagens ativas para o seu plano."
    );
  }

  return await tripRepository.create(tripData);
};

export const canCreateTrip = async (userId: string): Promise<boolean> => {
  const activeTrips = await tripRepository.countActiveTrips(userId);
  const userPlan = await getUserPlan(userId);

  if (userPlan?.name === "FREE" && activeTrips >= 1) {
    return false;
  }

  return true;
};

export const canUploadMoreImages = async (
  tripId: string,
  newImagesCount: number
): Promise<boolean> => {
  const currentImageCount = await tripRepository.countImages(tripId);
  const userPlan = await tripRepository.getUserPlanByTripId(tripId);

  if (userPlan === "free-plan-id" && currentImageCount + newImagesCount > 6) {
    return false;
  }

  return true;
};

export const getTrip = async (id: string) => {
  return await tripRepository.findById(id);
};

export const getAllTrip = async () => {
  return await tripRepository.getAll();
};
