import { Request, Response } from "express";
import { generateTravel } from "../../services/googleAIService";

export const chat = async (req: Request, res: Response) => {
  const {
    classLevel,
    budget,
    travelStyle,
    selectedItems,
    comfortableWithPublicTransport,
  } = req.body;

  try {
    const response = await generateTravel(req.body);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
