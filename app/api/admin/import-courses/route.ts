import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
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
    const courses = [];
    for (const record of records) {
      Object.keys(record).forEach((k) => {
        if (typeof record[k] === "string") record[k] = record[k].trim();
      });
      if (!record.name || !record.code || !record.credit || !record.semester || !record.department || !record.program) continue;
      const department = await prisma.department.findFirst({ where: { name: { equals: record.department, mode: "insensitive" } } });
      if (!department) continue;
      const program = await prisma.program.findFirst({ where: { name: { equals: record.program, mode: "insensitive" }, departmentId: department.id } });
      if (!program) continue;
      let teacherConnect = undefined;
      if (record.teacherCode) {
        const teacher = await prisma.teacher.findUnique({
          where: { code: record.teacherCode.trim() },
        });
        if (teacher) {
          teacherConnect = { connect: { id: teacher.id } };
        }
      }
      const course = await prisma.course.create({
        data: {
          name: String(record.name),
          code: String(record.code),
          credit: Number(record.credit),
          semester: Number(record.semester),
          department: { connect: { id: department.id } },
          program: { connect: { id: program.id } },
          ...(teacherConnect ? { teacher: teacherConnect } : {}),
        },
      });
      courses.push(course);
    }
    return NextResponse.json({ courses });
  } catch (e) {
    return NextResponse.json({ error: "Failed to import courses", e }, { status: 500 });
  }
}
