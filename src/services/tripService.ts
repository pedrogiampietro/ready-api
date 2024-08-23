import * as tripRepository from "../repositories/tripRepository";
import { FrontendTrip } from "../repositories/tripRepository";
import { getUserPlan } from "../repositories/userRepository";

export const createTrip = async (tripData: FrontendTrip) => {
  return await tripRepository.create(tripData);
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

export const getAllTripsByUserId = async (userId: string) => {
  return await tripRepository.getAllTripsByUserId(userId);
};

export const createTripByIA = async (tripData: any) => {
  const { canCreate, message } = await canCreateTrip(tripData.userId);

  if (!canCreate) {
    return {
      success: false,
      message:
        message ||
        "Você atingiu o número máximo de viagens ativas para o seu plano.",
    };
  }

  try {
    const newTrip = await tripRepository.createByIA({
      ...tripData,
    });

    return {
      success: true,
      trip: newTrip,
    };
  } catch (error) {
    console.error("Error creating trip: ", error);
    return {
      success: false,
      message: "Ocorreu um erro ao criar a viagem.",
    };
  }
};

export const updateTrip = async (tripId: string, tripData: FrontendTrip) => {
  return await tripRepository.update(tripId, tripData);
};

export const deleteTrip = async (tripId: string) => {
  return await tripRepository.deleteById(tripId);
};

export const addRestaurant = async (
  tripId: string,
  restaurantData: { name: string; url: string; budget: string }
) => {
  return await tripRepository.addRestaurantToTrip(tripId, restaurantData);
};

export const addItinerary = async (
  tripId: string,
  itineraryData: {
    date: Date;
    activity: string;
    description: string;
    url: string;
  }
) => {
  return await tripRepository.addItineraryToTrip(tripId, itineraryData);
};

export const getTripDetails = async (tripId: string) => {
  return await tripRepository.findTripById(tripId);
};

export const canCreateTrip = async (
  userId: string
): Promise<{ canCreate: boolean; message?: string }> => {
  const activeTrips = await tripRepository.countActiveTrips(userId);
  const userPlan = await getUserPlan(userId);

  if (!userPlan) {
    return {
      canCreate: false,
      message:
        "Você não possui um plano ativo. Por favor, faça upgrade para criar viagens.",
    };
  }

  if (userPlan.name === "FREE" && activeTrips >= 1) {
    return {
      canCreate: false,
      message:
        "Você já atingiu o limite de 1 viagem ativa para o plano gratuito. Faça upgrade para criar mais viagens.",
    };
  }

  return { canCreate: true };
};
