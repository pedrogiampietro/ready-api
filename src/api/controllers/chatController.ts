import { Request, Response } from "express";
import {
  generateTravel,
  generateEmbellishTitle,
} from "../../services/googleAIService";

export const chat = async (req: Request, res: Response) => {
  const {
    classLevel,
    budget,
    travelStyle,
    selectedItems,
    comfortableWithPublicTransport,
  } = req.body;

  // TODO validar req.

  try {
    const response = await generateTravel(req.body);

    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const embellishTitleChat = async (req: Request, res: Response) => {
  const { title } = req.body;

  // TODO validar req.

  try {
    const response = await generateEmbellishTitle(req.body);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
