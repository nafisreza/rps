
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
await prisma.passwordResetToken.deleteMany({
  where: {
    OR: [
      { expiresAt: { lt: new Date() } },
      { used: true }
    ]
  }
});
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());