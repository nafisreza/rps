import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const departments = await prisma.department.findMany({ select: { id: true, name: true } });
  return NextResponse.json({ departments });
}
