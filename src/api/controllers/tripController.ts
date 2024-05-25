import { Request, Response } from "express";
import * as tripService from "../../services/tripService";

export const createTrip = async (req: Request, res: Response) => {
  const trip = await tripService.createTrip(req.body);
  res.json(trip);
};

export const getTrip = async (req: Request, res: Response) => {
  const trip = await tripService.getTrip(req.params.id);
  res.json(trip);
};
