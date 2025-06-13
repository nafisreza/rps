import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = "teacher123";
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: "teacher@iut.edu",
      password: hashed,
      role: "TEACHER",
    },
  });

  console.log("Teacher user created:", user);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
