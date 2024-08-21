import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Verifica se o plano FREE já existe
  const existingFreePlan = await prisma.plan.findUnique({
    where: {
      id: "free-plan-id",
    },
  });

  // Se o plano FREE não existir, ele será criado
  if (!existingFreePlan) {
    const freePlan = await prisma.plan.create({
      data: {
        id: "free-plan-id", // ID opcionalmente predefinido, pode ser removido se preferir um UUID gerado automaticamente
        name: "FREE",
        features: [
          "Acesso limitado a funcionalidades",
          "Visualização de viagens",
        ],
      },
    });
    console.log("Plano FREE criado:", freePlan);
  } else {
    console.log("Plano FREE já existe, pulando criação.");
  }

  // Verifica se o plano PRO já existe
  const existingProPlan = await prisma.plan.findUnique({
    where: {
      id: "pro-plan-id",
    },
  });

  // Se o plano PRO não existir, ele será criado
  if (!existingProPlan) {
    const proPlan = await prisma.plan.create({
      data: {
        id: "pro-plan-id", // ID opcionalmente predefinido, pode ser removido se preferir um UUID gerado automaticamente
        name: "PRO",
        features: [
          "Acesso completo a todas as funcionalidades",
          "Criação ilimitada de viagens",
          "Suporte prioritário",
        ],
      },
    });
    console.log("Plano PRO criado:", proPlan);
  } else {
    console.log("Plano PRO já existe, pulando criação.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
