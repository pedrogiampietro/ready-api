import dotenv from "dotenv";

dotenv.config();

export const config = {
  googleApiKey: process.env.GENAI_API_KEY || "",
};
