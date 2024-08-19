import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Deleta todos os registros de Plan antes de recriá-los
  await prisma.plan.deleteMany();

  // Cria o plano FREE
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

  // Cria o plano PRO
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

  console.log({ freePlan, proPlan });
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
