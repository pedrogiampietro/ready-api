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
  const isCanCreateTrip = await canCreateTrip(tripData.userId);

  if (!isCanCreateTrip) {
    throw new Error(
      "Você atingiu o número máximo de viagens ativas para o seu plano."
    );
  }

  try {
    const newTrip = await tripRepository.createByIA({
      ...tripData,
    });

    return newTrip;
  } catch (error) {
    console.error("Error creating trip: ", error);
    throw new Error("An error occurred while creating the trip.");
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

export const canCreateTrip = async (userId: string): Promise<boolean> => {
  const activeTrips = await tripRepository.countTripsGeneratedByAI(userId);

  const userPlan = await getUserPlan(userId);

  if (userPlan?.name === "FREE" && activeTrips >= 1) {
    return false;
  }

  return true;
};

export const fetchPopularDestinations = async () => {
  try {
    const popularDestinations = await tripRepository.getPopularDestinations();
    return popularDestinations;
  } catch (error: any) {
    console.error("Error in fetchPopularDestinations:", error.message);
    throw new Error(`Error fetching popular destinations: ${error.message}`);
  }
};
