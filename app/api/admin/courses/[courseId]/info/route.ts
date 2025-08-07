import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      code: true,
      credit: true,
      semester: true,
      department: { select: { name: true } },
      program: { select: { name: true } },
      teacher: { select: { name: true } },
    },
  });
  return NextResponse.json({ course });
}
