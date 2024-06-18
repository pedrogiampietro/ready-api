import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/genConfig";
import { format } from "date-fns";

const genAI = new GoogleGenerativeAI(config.googleApiKey);
const googleAIClient = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateTravel = async (data: any): Promise<object> => {
  try {
    const prompt = `Por favor, forneça as melhores opções de voo, hospedagem com seus respectivos valores e também recomendações de restaurantes em ${
      data.destinationLocation
    }, incluindo URLs para as categorias mencionadas. Meu orçamento total para passagens, hospedagem e refeições é de ${
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
    )}, e retornar em ${format(data.flightReturnDate, "dd/MM/yyyy")}. 

    Retorne a resposta formatada como um JSON válido, sem markdown, sem nenhum texto adicional, com arrays de objetos para tópicos que possuem mais de um item, seguindo a estrutura abaixo:
    
    {
      "voo": {
        "companhia": "string",
        "preco": "string",
        "data": {
          "ida": "string",
          "volta": "string"
        },
        "url": "string"
      },
      "hospedagem": {
        "hotel": "string",
        "preco": "string",
        "url": "string"
      },
      "restaurantes": [
        {
          "categoria": "string",
          "locais": [
            {
              "nome": "string",
              "preco": "string",
              "url": "string"
            }
          ]
        }
      ],
      "roteiro": [
        {
          "dia": "number",
          "atividades": [
            "string"
          ]
        }
      ],
      "observacoes": [
        "string"
      ],
      "dicas_extras": [
        "string"
      ]
    }`;

    const result = await googleAIClient.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Remove any possible markdown code block markers from the response
    const cleanedText = text.replace(/```json|```/g, "").trim();

    // Parse the JSON response
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Erro ao parsear JSON:", parseError);
      throw new Error("Erro ao parsear JSON da resposta da IA");
    }

    return jsonResponse;
  } catch (error) {
    console.error("Erro ao chamar a API do Google:", error);
    throw new Error("Erro ao chamar a API do Google");
  }
};

export const generateEmbellishTitle = async (data: any): Promise<string> => {
  console.log("generateEmbellishTitle - Start");

  try {
    const prompt = `Por favor melhore o meu titulo: ${data.title} iremos utilizar ele para salvar o nosso planejamento de viagem, de uma melhorada para deixar mais limpo, atrativo e compreensivel`;
    console.log("Generated Prompt:", prompt);

    const result = await googleAIClient.generateContent(prompt);
    console.log("API Result:", result);

    const response = await result.response;
    const text = await response.text();
    console.log("Response Text:", text);

    const suggestionsAndTips = text.split(
      "\n\n**Dicas para um título ainda melhor:**\n\n"
    );
    console.log("Suggestions and Tips:", suggestionsAndTips);

    if (suggestionsAndTips.length > 0) {
      const categories = suggestionsAndTips[0].split("\n\n");
      console.log("Categories:", categories);

      // Filter and clean titles
      const validTitles = categories
        .map((category) => category.split("\n"))
        .flat()
        .filter(
          (line) => line.trim().startsWith("* **") && line.trim().endsWith("**")
        )
        .map((title) => title.replace(/^\*\*\s*\*\*|\*\*\s*\*\*$/g, "").trim());
      console.log("Valid Titles:", validTitles);

      if (validTitles.length > 0) {
        const randomTitle =
          validTitles[Math.floor(Math.random() * validTitles.length)];
        console.log("Random Title:", randomTitle);
        return randomTitle;
      } else {
        throw new Error("Não foram encontradas sugestões de títulos válidos");
      }
    } else {
      throw new Error("Não foram encontradas sugestões de títulos");
    }
  } catch (error) {
    console.error("Erro ao chamar a API do Google:", error);
    throw new Error("Erro ao chamar a API do Google");
  } finally {
    console.log("generateEmbellishTitle - End");
  }
};
