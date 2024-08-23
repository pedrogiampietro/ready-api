import { Request, Response } from "express";
import {
  generateTravel,
  generateEmbellishTitle,
} from "../../services/googleAIService";
import { canCreateTrip } from "../../services/tripService";

export const chat = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const canCreate = await canCreateTrip(userId);

    if (!canCreate) {
      return res.status(403).json({ error: "User cannot create more trips" });
    }

    const response = await generateTravel(req.body);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const embellishTitleChat = async (req: Request, res: Response) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const response = await generateEmbellishTitle(req.body);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
