import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { computeCourseResult, MarksInput } from "@/lib/grading";

const prisma = new PrismaClient();

// GET: List enrollments and course info for a course
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
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: { select: { id: true, name: true, studentId: true } },
      results: true,
    },
  });
  return NextResponse.json({ course, enrollments });
}

// POST: Save marks for all students (draft or submit)
export async function POST(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const { marks, submit } = await req.json();

  // Get course credit for calculation
  const courseObj = await prisma.course.findUnique({ where: { id: courseId }, select: { credit: true } });
  const credit = courseObj?.credit || 3;

  for (const [enrollmentId, mRaw] of Object.entries(marks)) {
    const m = (typeof mRaw === 'object' && mRaw !== null ? mRaw : {}) as MarksInput;
    const { total, grade, gradePoint } = computeCourseResult(credit, m);

    const data = {
      attendance: m.attendance ?? 0,
      quiz1: m.quiz1 ?? 0,
      quiz2: m.quiz2 ?? 0,
      quiz3: m.quiz3 ?? 0,
      quiz4: m.quiz4 ?? 0,
      midterm: m.midterm ?? 0,
      final: m.final ?? 0,
      total,
      grade,
      gradePoint,
    };
    const existing = await prisma.result.findFirst({ where: { enrollmentId } });
    if (existing) {
      await prisma.result.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.result.create({
        data: { enrollmentId, ...data },
      });
    }
  }

  // Find semester from course
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { semester: true } });
  const semester = course?.semester || 1;
  const existingStatus = await prisma.courseResultStatus.findFirst({ where: { courseId, semester } });
  const newStatus = submit ? "SUBMITTED" : "DRAFT";
  if (existingStatus) {
    await prisma.courseResultStatus.update({ where: { id: existingStatus.id }, data: { status: newStatus } });
  } else {
    await prisma.courseResultStatus.create({ data: { courseId, semester, status: newStatus } });
  }
  return NextResponse.json({ ok: true });
}
