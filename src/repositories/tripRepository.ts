import { PrismaClient, Trip } from "@prisma/client";
import { capitalizeFirstLetter } from "../utils";

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

export const create = async (tripData: FrontendTrip) => {
  const totalMealCost = Object.values(tripData.meals)
    .map((meal: string) => Number(meal) || 0)
    .reduce((a, b) => a + b, 0);

  const totalCost =
    Number(tripData.hotelPrice || 0) +
    Number(tripData.flightCost || 0) +
    Number(totalMealCost || 0);

  return await prisma.trip.create({
    data: {
      title: capitalizeFirstLetter(tripData.title),
      banner: tripData.headerImage || "",
      locationName: capitalizeFirstLetter(tripData.location),
      longitude: 0,
      latitude: 0,
      images: tripData.images || [],
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
};

export const findById = async (id: string) => {
  return await prisma.trip.findUnique({ where: { id } });
};

export const getAll = async () => {
  return await prisma.trip.findMany({
    include: {
      reviews: true,
    },
  });
};
