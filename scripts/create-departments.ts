import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const departments = [
  "CSE",
  "SWE",
  "EEE",
  "ME",
  "IPE",
  "CE",
  "BTM",
  "TVE",
];

async function main() {
  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Department '${name}' added.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
