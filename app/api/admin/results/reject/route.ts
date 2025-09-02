import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { courseId, reason } = await req.json();
  if (!courseId || !reason) {
    return new Response(JSON.stringify({ error: "Missing courseId or reason" }), { status: 400 });
  }

  // Find semester for course
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { semester: true } });
  if (!course) {
    return new Response(JSON.stringify({ error: "Course not found" }), { status: 404 });
  }
  const semester = course.semester;

  // Update course result status to DRAFT and save rejection reason
  const status = await prisma.courseResultStatus.findFirst({ where: { courseId, semester } });
  if (status) {
    await prisma.courseResultStatus.update({
      where: { id: status.id },
      data: {
        status: "DRAFT",
        rejectionReason: reason,
      },
    });
  } else {
    await prisma.courseResultStatus.create({
      data: {
        courseId,
        semester,
        status: "DRAFT",
        rejectionReason: reason,
      },
    });
  }

  return new Response(JSON.stringify({ ok: true }));
}
