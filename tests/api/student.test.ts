import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getJson, prisma } from "./helpers";
import { computeGpa } from "@/lib/grading";

let studentDbId: string;

describe("Student & master-data API", () => {
  beforeAll(async () => {
    const student = await prisma.student.findUnique({ where: { studentId: "20250001" } });
    expect(student).not.toBeNull();
    studentDbId = student!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("TC-18: departments API returns the seeded departments", async () => {
    const res = await getJson("/api/departments");
    expect(res.status).toBe(200);
    const names = res.body.departments.map((d: { name: string }) => d.name);
    expect(names).toContain("CSE");
    expect(names.length).toBeGreaterThanOrEqual(6);
  });

  it("TC-19: student results API groups courses by semester with GPA and CGPA", async () => {
    const res = await getJson(`/api/student/${studentDbId}/results`);
    expect(res.status).toBe(200);

    const { semesters, currentSemester, cgpa } = res.body;
    expect(currentSemester).toBe(2);
    expect(typeof cgpa).toBe("number");
    expect(Array.isArray(semesters)).toBe(true);
    expect(semesters.length).toBeGreaterThanOrEqual(1);

    // sorted ascending by semester
    const order = semesters.map((s: { semester: number }) => s.semester);
    expect(order).toEqual([...order].sort((a: number, b: number) => a - b));

    const sem1 = semesters.find((s: { semester: number }) => s.semester === 1);
    expect(sem1).toBeDefined();
    expect(typeof sem1.gpa).toBe("number");
    expect(sem1.courses.length).toBeGreaterThan(0);
    for (const course of sem1.courses) {
      expect(course.grade).toBeTruthy();
      expect(typeof course.gradePoint).toBe("number");
    }
  });

  it("TC-20: student CGPA API matches the credit-weighted computation from stored results", async () => {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: studentDbId },
      include: { course: true, results: true },
    });
    const entries = enrollments
      .filter((e) => e.results[0])
      .map((e) => ({ gradePoint: e.results[0].gradePoint, credit: e.course.credit }));
    const expected = computeGpa(entries);
    expect(expected).not.toBeNull();

    const res = await getJson(`/api/student/${studentDbId}/cgpa`);
    expect(res.status).toBe(200);
    expect(res.body.cgpa).toBeCloseTo(expected!, 9);
  });

  it("TC-21: student GPA API returns 400 when the semester parameter is missing", async () => {
    const res = await getJson(`/api/student/${studentDbId}/gpa`);
    expect(res.status).toBe(400);
  });
});
