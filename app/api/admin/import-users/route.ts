import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const role = formData.get("role") as string;
    if (!file || !role) {
      return NextResponse.json({ error: "Missing file or role" }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    let records: any[] = [];
    if (file.name.endsWith(".csv")) {
      const text = Buffer.from(arrayBuffer).toString("utf-8");
      const parsed = Papa.parse(text, { header: true });
      records = parsed.data as any[];
    } else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
      const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      records = XLSX.utils.sheet_to_json(sheet);
      // Normalize keys for each record
      records = records.map((rec) => {
        const norm: any = {};
        Object.keys(rec).forEach((k) => {
          const key = k.trim().replace(/\s+/g, "");
          norm[key] = rec[k];
        });
        return norm;
      });
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    const users = [];
    for (const record of records) {
      // Normalize all string fields and log for debugging
      Object.keys(record).forEach((k) => {
        if (typeof record[k] === "string") record[k] = record[k].trim();
      });
      // Log the record for debugging
      console.log("Import record:", record);
      if (!record.email || !record.password || !record.name || !record.department) continue;
      const hashed = await bcrypt.hash(record.password, 10);
      if (role === "STUDENT") {
        if (!record.batch || !record.studentId) continue;
        const department = await prisma.department.findFirst({ where: { name: { equals: record.department, mode: "insensitive" } } });
        if (!department) continue;
        const user = await prisma.user.create({
          data: {
            email: String(record.email),
            password: hashed,
            role: "STUDENT",
            student: {
              create: {
                name: String(record.name),
                batch: String(record.batch),
                studentId: String(record.studentId),
                email: String(record.email),
                department: { connect: { id: department.id } },
              },
            },
          },
        });
        users.push(user);
      } else if (role === "TEACHER") {
        if (!record.designation) continue;
        const department = await prisma.department.findFirst({ where: { name: { equals: record.department, mode: "insensitive" } } });
        if (!department) continue;
        const user = await prisma.user.create({
          data: {
            email: String(record.email),
            password: hashed,
            role: "TEACHER",
            teacher: {
              create: {
                name: String(record.name),
                // @ts-expect-error: allow string to enum assignment for import
                designation: String(record.designation),
                email: String(record.email),
                department: { connect: { id: department.id } },
              },
            },
          },
        });
        users.push(user);
      }
    }
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: "Failed to import users" }, { status: 500 });
  }
}
