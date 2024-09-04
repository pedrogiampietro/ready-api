import { Request, Response } from "express";
import * as tripService from "../../services/tripService";
import { uploadToS3 } from "../../middlewares/clouds3";
import { randomUUID as uuidv4 } from "node:crypto";
import { getSignedUrlForKey } from "../../utils";

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

    // console.log("trip", trip);

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
    comfortableWithPublicTransport,
    departureLocation,
    destinationLocation,
    flightDepartureDate,
    flightReturnDate,
    userId,
  } = req.body;

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

export const createTrip = async (req: any, res: Response) => {
  try {
    let bannerKey = null;
    if (req.files.banner && req.files.banner[0] && req.files.banner[0].path) {
      bannerKey = `banners/${uuidv4()}-${req.files.banner[0].originalname}`;
      await uploadToS3(req.files.banner[0], process.env.BUCKET_NAME, bannerKey);
    }

    const imageKeys = req.files.images
      ? await Promise.all(
          req.files.images
            .map(async (file: any) => {
              if (file.path) {
                const key = `images/${uuidv4()}-${file.originalname}`;
                await uploadToS3(file, process.env.BUCKET_NAME, key);
                return key;
              }
            })
            .filter(Boolean)
        )
      : [];

    const meals = req.body.meals || {
      breakfast: "0",
      lunch: "0",
      dinner: "0",
    };

    const tripData = {
      ...req.body,
      banner: bannerKey,
      images: imageKeys,
      flightDepartureDate:
        new Date(req.body.flightDepartureDate).toISOString() || new Date(),
      flightReturnDate:
        new Date(req.body.flightReturnDate).toISOString() || new Date(),
      flightCost: req.body.flightCost || 0,
      meals: {
        breakfast: meals.breakfast || "0",
        lunch: meals.lunch || "0",
        dinner: meals.dinner || "0",
      },
    };

    const trip = await tripService.createTrip(tripData);
    res.status(201).json(trip);
  } catch (error: any) {
    console.error("Error in createTrip controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateTrip = async (req: any, res: Response) => {
  try {
    const tripId = req.params.id;

    let bannerKey = null;
    let signedUrl = null;
    if (req.files && req.files.banner && req.files.banner[0]) {
      bannerKey = `banners/${uuidv4()}-${req.files.banner[0].originalname}`;
      await uploadToS3(
        req.files.banner[0].buffer,
        process.env.BUCKET_NAME,
        bannerKey
      );
      signedUrl = await getSignedUrlForKey(bannerKey);
    }

    const imageKeys =
      req.files && req.files.images
        ? await Promise.all(
            req.files.images.map(async (file: any) => {
              const key = `images/${uuidv4()}-${file.originalname}`;
              await uploadToS3(file.buffer, process.env.BUCKET_NAME, key);
              return key;
            })
          )
        : [];

    const meals = req.body.meals || { breakfast: "0", lunch: "0", dinner: "0" };

    const tripData = {
      ...req.body,
      banner: bannerKey,
      banner_bucket: signedUrl,
      images: imageKeys,
      flightDepartureDate: req.body.flightDepartureDate
        ? new Date(req.body.flightDepartureDate).toISOString()
        : null,
      flightReturnDate: req.body.flightReturnDate
        ? new Date(req.body.flightReturnDate).toISOString()
        : null,
      departureDate: req.body.departureDate
        ? new Date(req.body.departureDate).toISOString()
        : null,
      returnDate: req.body.returnDate
        ? new Date(req.body.returnDate).toISOString()
        : null,
      meals: {
        breakfast: meals.breakfast || "0",
        lunch: meals.lunch || "0",
        dinner: meals.dinner || "0",
      },
    };

    const trip = await tripService.updateTrip(tripId, tripData);
    res.status(200).json(trip);
  } catch (error: any) {
    console.error("Error in updateTrip controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const tripId = req.params.id;
    await tripService.deleteTrip(tripId);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting trip:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const addRestaurant = async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const { name, url, budget } = req.body;

  try {
    const newRestaurant = await tripService.addRestaurant(tripId, {
      name,
      url,
      budget,
    });
    res.status(201).json(newRestaurant);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to add restaurant to trip" });
  }
};

export const addItinerary = async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const { date, activity, description, url } = req.body;

  try {
    const newItinerary = await tripService.addItinerary(tripId, {
      date,
      activity,
      description,
      url,
    });
    res.status(201).json(newItinerary);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to add itinerary to trip" });
  }
};

export const getTripDetails = async (req: Request, res: Response) => {
  const { tripId } = req.params;

  try {
    const tripDetails = await tripService.getTripDetails(tripId);
    res.status(200).json(tripDetails);
  } catch (error: any) {
    res.status(404).json({ error: "Trip not found" });
  }
};
