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

    // return await prisma.trip.create({
    //   data: {
    //     title: capitalizeFirstLetter(tripData.title),
    //     banner: tripData.banner,
    //     destinationLocation: capitalizeFirstLetter(tripData.location),
    //     longitude: 0,
    //     latitude: 0,
    //     images: tripData.images,
    //     hotelName: tripData.accommodation,
    //     accommodationDuration: Number(tripData.accommodationDuration),
    //     hotelPrice: Number(tripData.accommodationPrice),
    //     departureDate: tripData.flightDepartureDate,
    //     returnDate: tripData.flightReturnDate,
    //     flightCost: Number(tripData.flightCost),
    //     mealCost: totalMealCost,
    //     totalCost: totalCost,
    //     userId: tripData.userId,
    //   },
    // });
  } catch (error: any) {
    console.error("Error in tripRepository:", error.message);
    throw new Error(`Error creating trip: ${error.message}`);
  }
};

export const getAll = async () => {
  const trips = await prisma.trip.findMany({
    include: {
      reviews: true,
      itineraries: true,
      restaurants: true,
    },
  });

  for (const trip of trips) {
    if (trip.banner) {
      trip.banner = await getSignedUrlForKey(trip.banner);
    }

    if (trip.images && trip.images.length > 0) {
      const signedUrls = await Promise.all(
        trip.images.map((image) => getSignedUrlForKey(image))
      );

      trip.images = signedUrls.filter((url): url is string => url !== null);
    } else {
      trip.images = [];
    }
  }

  return trips;
};

export const findById = async (id: string) => {
  const trip = (await prisma.trip.findUnique({ where: { id } })) as any;

  trip.banner = await getSignedUrlForKey(trip.banner);
  trip.images = await Promise.all(trip.images.map(getSignedUrlForKey));

  return trip;
};

export const getAllTripsByUserId = async (userId: string) => {
  const trips = await prisma.trip.findMany({
    where: { userId },
    include: {
      restaurants: true,
      itineraries: true,
      reviews: true,
    },
  });

  for (const trip of trips) {
    if (trip.banner) {
      trip.banner = await getSignedUrlForKey(trip.banner);
    }

    if (trip.images && trip.images.length > 0) {
      const signedUrls = await Promise.all(
        trip.images.map((image) => getSignedUrlForKey(image))
      );

      trip.images = signedUrls.filter((url): url is string => url !== null);
    } else {
      trip.images = [];
    }
  }

  return trips;
};

export const createByIA = async (tripData: any) => {
  const {
    restaurantes,
    roteiro,
    observacoes,
    dicas_extras,
    ...restOfTripData
  } = tripData;

  const restaurantesData = restaurantes
    ?.map((categoria: any) => {
      return categoria.locais?.map((restaurante: any) => ({
        name: restaurante.nome,
        url: restaurante.url,
        budget: restaurante.preco,
      }));
    })
    .flat();

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const startDate = new Date(restOfTripData.departureDate) as any;
  const endDate = new Date(restOfTripData.returnDate) as any;
  const totalDays =
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // Número total de dias

  const roteiroData = roteiro
    ?.map((dia: any, index: number) => {
      if (index < totalDays) {
        return {
          date: addDays(startDate, index), // Ajusta a data para cada dia do roteiro
          activity: `Dia ${dia.dia}`,
          description: dia.atividades.join(", "),
          url: "",
        };
      }
      return null;
    })
    .filter(Boolean);

  return await prisma.trip.create({
    data: {
      ...restOfTripData,
      observacoes,
      dicasExtras: dicas_extras,
      restaurants: {
        create: restaurantesData,
      },
      itineraries: {
        create: roteiroData,
      },
    },
  });
};
