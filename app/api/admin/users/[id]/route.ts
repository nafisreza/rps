import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await req.json();
  let departmentId = data.departmentId;
  // If department name is provided, resolve departmentId
  if (!departmentId && data.department && data.department.name) {
    const dept = await prisma.department.findFirst({
      where: { name: { equals: data.department.name, mode: "insensitive" } },
    });
    if (dept) departmentId = dept.id;
  } else if (!departmentId && typeof data.department === "string") {
    const dept = await prisma.department.findFirst({
      where: { name: { equals: data.department, mode: "insensitive" } },
    });
    if (dept) departmentId = dept.id;
  }
  try {
    // Update logic for student or teacher based on data.role
    if (data.role === "STUDENT") {
      await prisma.student.update({
        where: { userId: params.id },
        data: {
          name: data.name,
          batch: data.batch,
          studentId: data.studentId,
          email: data.email,
          departmentId,
        },
      });
    } else if (data.role === "TEACHER") {
      await prisma.teacher.update({
        where: { userId: params.id },
        data: {
          name: data.name,
          designation: data.designation,
          email: data.email,
          departmentId,
        },
      });
    }
    await prisma.user.update({
      where: { id: params.id },
      data: { email: data.email },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  try {
    // Delete student or teacher first if exists
    await prisma.student.deleteMany({ where: { userId: id } });
    await prisma.teacher.deleteMany({ where: { userId: id } });
    // Then delete the user
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
