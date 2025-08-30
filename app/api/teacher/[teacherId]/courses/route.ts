import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function GET(req: NextRequest, context: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await context.params;
  if (!teacherId) {
    return new Response(JSON.stringify({ error: "Missing teacherId" }), { status: 400 });
  }

  const courses = await prisma.course.findMany({
    where: { teacherId },
    select: {
      id: true,
      name: true,
      code: true,
      semester: true,
      credit: true,
      department: { select: { name: true } },
      program: { select: { name: true } },
    },
    orderBy: { semester: "asc" },
  });

  return new Response(
    JSON.stringify({ courses }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
