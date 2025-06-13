import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const role = formData.get("role");
    if (!file || !role || typeof role !== "string") {
      return NextResponse.json({ error: "Missing file or role" }, { status: 400 });
    }
    const buffer = Buffer.from(await (file as Blob).arrayBuffer());
    const csv = buffer.toString("utf-8");
    const records = parse(csv, { columns: true });
    const users = [];
    for (const record of records) {
      if (!record.email || !record.password) continue;
      const hashed = await bcrypt.hash(record.password, 10);
      const user = await prisma.user.create({
        data: { email: record.email, password: hashed, role },
      });
      users.push(user);
    }
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: "Failed to import users" }, { status: 500 });
  }
}
