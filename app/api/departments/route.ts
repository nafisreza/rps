import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("id");
  if (departmentId) {
    const programs = await prisma.program.findMany({ where: { departmentId }, select: { id: true, name: true } });
    return NextResponse.json({ programs });
  }
  const departments = await prisma.department.findMany({ select: { id: true, name: true } });
  return NextResponse.json({ departments });
}
