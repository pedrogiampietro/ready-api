import { PrismaClient, Trip } from "@prisma/client";

const prisma = new PrismaClient();

export const create = async (tripData: Trip) => {
  // Calcula o custo total
  const totalCost =
    tripData.hotelPrice + tripData.flightCost + tripData.mealCost;

  // Cria a trip no banco de dados
  return await prisma.trip.create({
    data: {
      title: tripData.title,
      banner: tripData.banner,
      locationName: tripData.locationName,
      longitude: tripData.longitude,
      latitude: tripData.latitude,
      images: tripData.images,
      hotelName: tripData.hotelName,
      hotelPrice: tripData.hotelPrice,
      departureDate: tripData.departureDate,
      returnDate: tripData.returnDate,
      flightCost: tripData.flightCost,
      mealCost: tripData.mealCost,
      totalCost: totalCost, // Preenche o custo total
      userId: tripData.userId,
      // Considera que as reviews não serão incluídas na criação inicial
    },
  });
};

export const findById = async (id: string) => {
  return await prisma.trip.findUnique({ where: { id } });
};

export const getAll = async () => {
  return await prisma.trip.findMany();
};
