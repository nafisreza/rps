import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { password } = await req.json();
  if (!password || password.length < 8) {
    return new Response("Password too short", { status: 400 });
  }
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  if (!strong) {
    return new Response("Password not strong enough", { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashed, mustChangePassword: false },
  });
  return new Response("OK");
}
