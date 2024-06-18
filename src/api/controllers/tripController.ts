import { Request, Response } from "express";
import * as tripService from "../../services/tripService";
import { uploadToS3 } from "../../middlewares/clouds3";
import { randomUUID } from "node:crypto";

export const createTrip = async (req: any, res: Response) => {
  try {
    const bannerKey = `banners/${randomUUID()}-${
      req.files.banner[0].originalname
    }`;
    await uploadToS3(req.files.banner[0], process.env.BUCKET_NAME, bannerKey);

    const imageKeys = req.files.images
      ? await Promise.all(
          req.files.images.map(async (file: any) => {
            const key = `images/${randomUUID()}-${file.originalname}`;
            await uploadToS3(file, process.env.BUCKET_NAME, key);
            return key;
          })
        )
      : [];

    const tripData = {
      ...req.body,
      banner: bannerKey,
      images: imageKeys,
      flightDepartureDate: new Date(req.body.flightDepartureDate).toISOString(),
      flightReturnDate: new Date(req.body.flightReturnDate).toISOString(),
    };

    const trip = await tripService.createTrip(tripData);
    res.status(201).json(trip);
  } catch (error: any) {
    console.error("Error in createTrip controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getTrip = async (req: Request, res: Response) => {
  try {
    const trip = await tripService.getTrip(req.params.id);
    res.status(200).json(trip);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTrip = async (req: Request, res: Response) => {
  try {
    const trip = await tripService.getAllTrip();

    console.log("trip", trip);

    res.status(200).json(trip);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTripsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params as any;

  try {
    const trip = await tripService.getAllTripsByUserId(userId);
    res.status(200).json(trip);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTripByIA = async (req: Request, res: Response) => {
  const {
    travelPlan: {
      voo,
      hospedagem,
      restaurantes,
      roteiro,
      observacoes,
      dicas_extras,
    },
    classLevel,
    budget,
    travelStyle,
    selectedItems,
    comfortableWithPublicTransport,
    departureLocation,
    destinationLocation,
    flightDepartureDate,
    flightReturnDate,
    userId,
  } = req.body;

  console.log("Dados extraídos do req.body:", {
    voo,
    hospedagem,
    restaurantes,
    roteiro,
    observacoes,
    dicas_extras,
    classLevel,
    budget,
    travelStyle,
    selectedItems,
    comfortableWithPublicTransport,
    departureLocation,
    destinationLocation,
    flightDepartureDate,
    flightReturnDate,
    userId,
  });

  const flightCost = parseFloat(
    voo.preco.replace("R$ ", "").replace(".", "").replace(",", ".")
  );
  const hotelPrice = parseFloat(
    hospedagem.preco
      .split(" ")[1]
      .replace("R$", "")
      .replace(".", "")
      .replace(",", ".")
  );

  const flightDepartureDateSerealized = new Date(flightDepartureDate);
  const flightReturnDateSerealized = new Date(flightReturnDate);

  let totalCost = 0;
  let accommodationDuration = 0;

  if (
    flightDepartureDateSerealized instanceof Date &&
    !isNaN(flightDepartureDateSerealized.valueOf()) &&
    flightReturnDateSerealized instanceof Date &&
    !isNaN(flightReturnDateSerealized.valueOf())
  ) {
    accommodationDuration = Math.ceil(
      (flightReturnDateSerealized.getTime() -
        flightDepartureDateSerealized.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    totalCost = flightCost + hotelPrice * accommodationDuration;
  }

  console.log("Custos calculados:", {
    flightCost,
    hotelPrice,
    accommodationDuration,
    totalCost,
  });

  console.log("Datas serializadas:", {
    flightDepartureDateSerealized,
    flightReturnDateSerealized,
  });

  try {
    const newTrip = await tripService.createTripByIA({
      title: `Nova Viagem de ${departureLocation} para ${destinationLocation}`,
      banner: "",
      departureLocation,
      destinationLocation,
      longitude: 0,
      latitude: 0,
      images: [],
      hotelName: hospedagem.hotel,
      hotelPrice,
      accommodationDuration,
      departureDate: flightDepartureDateSerealized,
      returnDate: flightReturnDateSerealized,
      flightCost,
      mealCost: 0,
      totalCost,
      userId,
      comfortableWithPublicTransport,
      restaurantes,
      roteiro,
      classLevel,
      budgetTravel: parseFloat(budget),
      observacoes,
      dicas_extras,
    });

    res.status(201).json(newTrip);
  } catch (error) {
    console.error("Error creating trip: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the trip." });
  }
};
