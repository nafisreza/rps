import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = "student123";
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: "student@iut.edu",
      password: hashed,
      role: "STUDENT",
    },
  });

  console.log("Student user created:", user);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
