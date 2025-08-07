import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await context.params;
  if (!studentId) {
    return new Response(JSON.stringify({ error: "Missing student id" }), { status: 400 });
  }
  // Find all enrollments for this student
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          department: true,
          program: true,
          teacher: true,
        },
      },
    },
  });
  // Map to course objects
  const courses = enrollments.map((e) => e.course);
  return Response.json({ courses });
}
