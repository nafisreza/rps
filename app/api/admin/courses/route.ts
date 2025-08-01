import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET: List all courses
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("departmentId");
  const programId = searchParams.get("programId");
  const semester = searchParams.get("semester");
  const teacherId = searchParams.get("teacherId");
  const credit = searchParams.get("credit");
  const name = searchParams.get("name");
  const code = searchParams.get("code");

  const where: any = {};
  if (departmentId) where.departmentId = departmentId;
  if (programId) where.programId = programId;
  if (semester) where.semester = Number(semester);
  if (teacherId) where.teacherId = teacherId;
  if (credit) where.credit = Number(credit);
  if (name) where.name = { contains: name, mode: "insensitive" };
  if (code) where.code = { contains: code, mode: "insensitive" };

  const courses = await prisma.course.findMany({
    where,
    include: {
      department: true,
      teacher: true,
      program: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ courses });
}

// POST: Create a new course
export async function POST(req: NextRequest) {
  const data = await req.json();
  try {
    // Create the course
    const course = await prisma.course.create({
      data: {
        name: data.name,
        code: data.code,
        credit: data.credit,
        semester: data.semester,
        departmentId: data.departmentId,
        teacherId: data.teacherId || null,
        programId: data.programId,
      },
    });
    // No auto-enrollment. Admin will enroll students manually.
    return NextResponse.json({ course });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create course", e }, { status: 500 });
  }
}

// PATCH: Update a course
export async function PATCH(req: NextRequest) {
  const data = await req.json();
  try {
    const course = await prisma.course.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        credit: data.credit,
        semester: data.semester,
        departmentId: data.departmentId,
        teacherId: data.teacherId || null,
        programId: data.programId,
      },
    });
    return NextResponse.json({ course });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update course", e }, { status: 500 });
  }
}

// DELETE: Delete a course
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  try {
    await prisma.course.delete({
      where: { id: data.id },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete course", e }, { status: 500 });
  }
}
