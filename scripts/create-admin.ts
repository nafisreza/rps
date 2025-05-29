import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = "admin123";
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: "nafisrezabd@gmail.com",
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", user);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
