import { PrismaClient, Trip } from "@prisma/client";
import { capitalizeFirstLetter, getSignedUrlForKey } from "../utils";

const prisma = new PrismaClient();

interface Meal {
  checked: boolean;
  value: string;
}

interface Meals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export interface FrontendTrip extends Trip {
  meals: Meals;
  headerImage: string;
  accommodation: string;
  location: string;
  flightDepartureDate: string;
  flightReturnDate: string;
  accommodationPrice: number;
}

export const create = async (tripData: any) => {
  try {
    if (
      !tripData ||
      !tripData.title ||
      !tripData.banner ||
      !tripData.location ||
      !tripData.accommodation
    ) {
      throw new Error("Missing required trip data.");
    }

    // Ensure meals data is defined
    if (!tripData.meals) {
      tripData.meals = {
        breakfast: { checked: false, value: "" },
        lunch: { checked: false, value: "" },
        dinner: { checked: false, value: "" },
      };
    }

    const totalMealCost = Object.values(tripData.meals)
      .map((meal: any) => Number(meal.value) || 0)
      .reduce((a, b) => a + b, 0);

    const totalCost =
      Number(tripData.accommodationPrice || 0) +
      Number(tripData.flightCost || 0) +
      totalMealCost;

    return await prisma.trip.create({
      data: {
        title: capitalizeFirstLetter(tripData.title),
        banner: tripData.banner,
        locationName: capitalizeFirstLetter(tripData.location),
        longitude: 0,
        latitude: 0,
        images: tripData.images,
        hotelName: tripData.accommodation,
        accommodationDuration: Number(tripData.accommodationDuration),
        hotelPrice: Number(tripData.accommodationPrice),
        departureDate: tripData.flightDepartureDate,
        returnDate: tripData.flightReturnDate,
        flightCost: Number(tripData.flightCost),
        mealCost: totalMealCost,
        totalCost: totalCost,
        userId: tripData.userId,
      },
    });
  } catch (error: any) {
    console.error("Error in tripRepository:", error.message);
    throw new Error(`Error creating trip: ${error.message}`);
  }
};

export const getAll = async () => {
  const trips = await prisma.trip.findMany({
    include: {
      reviews: true,
    },
  });

  for (const trip of trips) {
    trip.banner = await getSignedUrlForKey(trip.banner);
    trip.images = await Promise.all(trip.images.map(getSignedUrlForKey));
  }

  return trips;
};

export const findById = async (id: string) => {
  const trip = (await prisma.trip.findUnique({ where: { id } })) as any;

  trip.banner = await getSignedUrlForKey(trip.banner);
  trip.images = await Promise.all(trip.images.map(getSignedUrlForKey));

  return trip;
};
