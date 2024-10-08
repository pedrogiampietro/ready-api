import { PrismaClient } from "@prisma/client";
import { capitalizeFirstLetter, getSignedUrlForKey } from "../utils";

const prisma = new PrismaClient();

export interface Meal {
  checked: boolean;
  value: string;
}

export interface Meals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export interface FrontendTrip {
  title: string;
  departureLocation: string;
  destinationLocation: string;
  accommodation: string;
  accommodationDuration: string;
  accommodationPrice: string;
  flightDepartureDate: string;
  flightReturnDate: string;
  flightCost: string;
  userId: string;
  meals?: Meals;
  banner?: string;
  images?: string[];
  [key: string]: any;
}

export const create = async (tripData: any) => {
  try {
    const requiredFields = [
      "title",
      "departureLocation",
      "destinationLocation",
      "accommodation",
      "accommodationDuration",
      "accommodationPrice",
      "flightDepartureDate",
      "flightReturnDate",
      "flightCost",
      "userId",
    ];

    const missingFields = requiredFields.filter((field) => !tripData[field]);

    if (missingFields.length > 0) {
      console.error("Missing required trip data:", tripData);
      throw new Error(
        `Missing required trip data: ${missingFields.join(", ")}`
      );
    }

    if (!tripData.meals) {
      tripData.meals = {
        breakfast: { checked: false, value: "" },
        lunch: { checked: false, value: "" },
        dinner: { checked: false, value: "" },
      };
    } else {
      tripData.meals = {
        breakfast: { checked: true, value: tripData.meals.breakfast || "0" },
        lunch: { checked: true, value: tripData.meals.lunch || "0" },
        dinner: { checked: true, value: tripData.meals.dinner || "0" },
      };
    }

    const totalMealCost = Object.values(tripData.meals)
      .map((meal: any) => Number(meal.value) || 0)
      .reduce((a, b) => a + b, 0);

    const totalCost =
      Number(
        tripData.accommodationPrice * tripData.accommodationDuration || 0
      ) +
      Number(tripData.flightCost || 0) +
      totalMealCost;

    return await prisma.trip.create({
      data: {
        title: capitalizeFirstLetter(tripData.title),
        banner: tripData.banner || null,
        images: tripData.images || [],
        longitude: 0,
        latitude: 0,
        hotelName: tripData.accommodation,
        departureLocation: capitalizeFirstLetter(tripData.departureLocation),
        destinationLocation: capitalizeFirstLetter(
          tripData.destinationLocation
        ),
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
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      },
      itineraries: true,
      restaurants: true,
    },
    orderBy: {
      createdAt: "desc",
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
    userId,
    ...restOfTripData
  } = tripData;

  // Verificar se o usuário já tem uma viagem gerada por IA
  const userPlan = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (userPlan?.plan.name === "FREE") {
    const aiTripCount = await countTripsGeneratedByAI(userId);
    if (aiTripCount > 0) {
      throw new Error("User cannot create more trips with AI in FREE plan");
    }
  }

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
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const roteiroData = roteiro
    ?.map((dia: any, index: number) => {
      if (index < totalDays) {
        return {
          date: addDays(startDate, index),
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
      user: {
        connect: {
          id: userId,
        },
      },
      restaurants: {
        create: restaurantesData,
      },
      itineraries: {
        create: roteiroData,
      },
      generatedByAI: true,
    },
  });
};

export const update = async (tripId: string, tripData: any) => {
  try {
    const requiredFields = [
      "title",
      "departureLocation",
      "destinationLocation",
      "accommodationName",
      "accommodationDuration",
      "accommodationPrice",
      "flightDepartureDate",
      "flightReturnDate",
      "flightCost",
      "userId",
    ];

    const missingFields = requiredFields.filter((field) => !tripData[field]);

    if (missingFields.length > 0) {
      console.error("Missing required trip data:", tripData);
      throw new Error(
        `Missing required trip data: ${missingFields.join(", ")}`
      );
    }

    const meals = tripData.meals || {
      breakfast: { checked: false, value: "0" },
      lunch: { checked: false, value: "0" },
      dinner: { checked: false, value: "0" },
    };

    const totalMealCost = Object.values(meals)
      .map((meal: any) => Number(meal.value) || 0)
      .reduce((a, b) => a + b, 0);

    const totalCost =
      Number(tripData.accommodationPrice || 0) +
      Number(tripData.flightCost || 0) +
      totalMealCost;

    return await prisma.trip.update({
      where: { id: tripId },
      data: {
        title: capitalizeFirstLetter(tripData.title),
        banner: tripData.banner || null,
        banner_bucket: tripData.banner_bucket || null,
        images: tripData.images || [],
        longitude: 0,
        latitude: 0,
        hotelName: tripData.accommodationName,
        departureLocation: capitalizeFirstLetter(tripData.departureLocation),
        destinationLocation: capitalizeFirstLetter(
          tripData.destinationLocation
        ),
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
    throw new Error(`Error updating trip: ${error.message}`);
  }
};

export const deleteById = async (tripId: string) => {
  try {
    await prisma.restaurant.deleteMany({ where: { tripId } });
    await prisma.itinerary.deleteMany({ where: { tripId } });
    await prisma.review.deleteMany({ where: { tripId } });
    await prisma.trip.delete({ where: { id: tripId } });
  } catch (error: any) {
    console.error("Error in tripRepository:", error.message);
    throw new Error(`Error deleting trip: ${error.message}`);
  }
};

export const countTripsGeneratedByAI = async (
  userId: string
): Promise<number> => {
  return prisma.trip.count({
    where: {
      userId,
      generatedByAI: true,
    },
  });
};

export const countImages = async (tripId: string): Promise<number> => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });
  return trip?.images.length || 0;
};

export const getUserPlanByTripId = async (tripId: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { user: true },
  });

  return trip?.user.planId;
};

export const addRestaurantToTrip = async (
  tripId: string,
  restaurantData: { name: string; url: string; budget: string }
) => {
  try {
    const requiredFields: Array<keyof typeof restaurantData> = [
      "name",
      "url",
      "budget",
    ];

    const missingFields = requiredFields.filter(
      (field) => !restaurantData[field]
    );

    if (missingFields.length > 0) {
      console.error("Missing required restaurant data:", restaurantData);
      throw new Error(
        `Missing required restaurant data: ${missingFields.join(", ")}`
      );
    }

    return await prisma.restaurant.create({
      data: {
        name: restaurantData.name,
        url: restaurantData.url,
        budget: restaurantData.budget,
        trip: {
          connect: { id: tripId },
        },
      },
    });
  } catch (error: any) {
    console.error("Error in addRestaurantToTrip:", error.message);
    throw new Error(`Error adding restaurant to trip: ${error.message}`);
  }
};

export const addItineraryToTrip = async (
  tripId: string,
  itineraryData: {
    date: Date;
    activity: string;
    description: string;
    url: string;
  }
) => {
  try {
    const requiredFields: Array<keyof typeof itineraryData> = [
      "date",
      "activity",
      "description",
    ];

    const missingFields = requiredFields.filter(
      (field) => !itineraryData[field]
    );

    if (missingFields.length > 0) {
      console.error("Missing required itinerary data:", itineraryData);
      throw new Error(
        `Missing required itinerary data: ${missingFields.join(", ")}`
      );
    }

    return await prisma.itinerary.create({
      data: {
        date: itineraryData.date,
        activity: itineraryData.activity,
        description: itineraryData.description,
        url: itineraryData.url || "",
        trip: {
          connect: { id: tripId },
        },
      },
    });
  } catch (error: any) {
    console.error("Error in addItineraryToTrip:", error.message);
    throw new Error(`Error adding itinerary to trip: ${error.message}`);
  }
};

export const findTripById = async (tripId: string) => {
  try {
    return await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        restaurants: true,
        itineraries: true,
      },
    });
  } catch (error: any) {
    console.error("Error in findTripById:", error.message);
    throw new Error(`Error finding trip by id: ${error.message}`);
  }
};

export const getPopularDestinations = async () => {
  try {
    const popularDestinations = await prisma.trip.groupBy({
      by: ["destinationLocation"],
      _count: {
        destinationLocation: true,
      },
      orderBy: {
        _count: {
          destinationLocation: "desc",
        },
      },
      take: 10,
    });

    // Para cada destino, obtenha detalhes e gere uma URL assinada para o banner
    const destinationDetails = await Promise.all(
      popularDestinations.map(async (destination: any) => {
        const details = await prisma.trip.findFirst({
          where: {
            destinationLocation: destination.destinationLocation,
          },
          select: {
            id: true,
            departureLocation: true,
            totalCost: true,

            banner: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        });

        let signedUrl = null;
        if (details?.banner) {
          signedUrl = await getSignedUrlForKey(details.banner);
        }

        return {
          id: details?.id,
          location: destination.destinationLocation,
          from: details?.departureLocation,
          totalCost: details?.totalCost,
          banner_bucket: signedUrl,
          count: destination._count.destinationLocation,
          rating: details?.reviews[0]?.rating || 0,
        };
      })
    );

    return destinationDetails;
  } catch (error: any) {
    console.error("Error in getPopularDestinations:", error.message);
    throw new Error(`Error fetching popular destinations: ${error.message}`);
  }
};
