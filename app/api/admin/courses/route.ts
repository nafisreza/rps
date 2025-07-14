import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET: List all courses
export async function GET(req: NextRequest) {
  const courses = await prisma.course.findMany({
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
