import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log("User already exists, skipping seed.");
    return;
  }
  const user = await prisma.user.create({
    data: { email: "enricochavomartin@gmail.com" },
  });
  console.log("Created default user:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
