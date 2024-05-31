import { Request, Response } from "express";
import * as tripService from "../../services/tripService";
import { uploadToS3 } from "../../middlewares/clouds3";
import { randomUUID } from "node:crypto";

export const createTrip = async (req: any, res: Response) => {
  try {
    // Upload banner and images to S3
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

    res.status(200).json(trip);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
