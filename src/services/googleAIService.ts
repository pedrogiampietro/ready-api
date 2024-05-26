import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/genConfig";
import { format } from "date-fns";

const genAI = new GoogleGenerativeAI(config.googleApiKey);
const googleAIClient = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateTravel = async (data: any): Promise<string> => {
  try {
    const prompt = `Por favor, me forneça as melhores opções de voo, hospedagem com seus respectivos valores, e também recomendações de restaurantes em ${
      data.destinationLocation
    }, podendo me mandar url das categorias também. Meu orçamento total para passagens, hospedagem e refeições é de ${
      data.budget
    } reais. Estou disposto a gastar com base na minha classe social ${
      data.classLevel
    }. Prefiro uma viagem que tenha mais ênfase em ${
      data.travelStyle
    }. Durante esta viagem, estou interessado em explorar a vida ${data.selectedItems.join(
      ", "
    )}. Sou ${
      data.comfortableWithPublicTransport ? "sim" : "não"
    } confortável usando metrô e ônibus. Pretendo partir de ${
      data.departureLocation
    } com destino a ${data.destinationLocation} no dia ${format(
      data.flightDepartureDate,
      "dd/MM/yyyy"
    )}, e retornar em ${format(data.flightReturnDate, "dd/MM/yyyy")}.`;

    const result = await googleAIClient.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Erro ao chamar a API do Google:", error);
    throw new Error("Erro ao chamar a API do Google");
  }
};
