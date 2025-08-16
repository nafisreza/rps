import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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
    const m = (typeof mRaw === 'object' && mRaw !== null ? mRaw : {}) as {
      attendance?: number;
      quiz1?: number;
      quiz2?: number;
      quiz3?: number;
      quiz4?: number;
      midterm?: number;
      final?: number;
    };
    // Calculate total, grade, gradePoint
    const totalMark = credit * 100;
    const attendanceMark = ((m.attendance || 0) / 100) * (totalMark * 0.1);
    const quizzes = [m.quiz1 || 0, m.quiz2 || 0, m.quiz3 || 0, m.quiz4 || 0].sort((a, b) => b - a).slice(0, 3);
    const quizMark = (quizzes.reduce((a, b) => a + b, 0) / 300) * (totalMark * 0.15);
    const midtermMark = ((m.midterm || 0) / 100) * (totalMark * 0.25);
    const finalMark = ((m.final || 0) / 100) * (totalMark * 0.5);
    const total = attendanceMark + quizMark + midtermMark + finalMark;
    let grade = "F", gradePoint = 0;
    const percent = (total / totalMark) * 100;
    if (percent >= 80) [grade, gradePoint] = ["A+", 4.0];
    else if (percent >= 75) [grade, gradePoint] = ["A", 3.75];
    else if (percent >= 70) [grade, gradePoint] = ["A-", 3.5];
    else if (percent >= 65) [grade, gradePoint] = ["B+", 3.25];
    else if (percent >= 60) [grade, gradePoint] = ["B", 3.0];
    else if (percent >= 55) [grade, gradePoint] = ["B-", 2.75];
    else if (percent >= 50) [grade, gradePoint] = ["C+", 2.5];
    else if (percent >= 45) [grade, gradePoint] = ["C", 2.25];
    else if (percent >= 40) [grade, gradePoint] = ["D", 2.0];
    // Save all fields
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
  // Update CourseResultStatus based on draft/submit
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
