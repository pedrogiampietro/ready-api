import { Request, Response } from "express";
import * as tripService from "../../services/tripService";

export const createTrip = async (req: Request, res: Response) => {
  try {
    const trip = await tripService.createTrip(req.body);
    res.status(201).json(trip);
  } catch (error: any) {
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
