import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { BASE, getJson, postJson, prisma } from "./helpers";
import { computeCourseResult, MarksInput } from "@/lib/grading";

// Full result lifecycle on a dedicated test course so seeded data stays intact:
// create + enroll → draft → submit → reject → resubmit → approve → PDF.
const COURSE_CODE = "SQA 9101";
const COURSE_SEMESTER = 2;
const STUDENT_IDS = ["20250001", "20250002", "20250003"];

const MARKS: MarksInput[] = [
  { attendance: 96, quiz1: 15, quiz2: 14, quiz3: 13, quiz4: 10, midterm: 70, final: 140 },
  { attendance: 92, quiz1: 12, quiz2: 11, quiz3: 10, quiz4: 9, midterm: 60, final: 110 },
  { attendance: 70, quiz1: 8, quiz2: 7, quiz3: 6, quiz4: 5, midterm: 40, final: 70 },
];

let courseId: string;
let credit: number;
let students: { id: string; studentId: string }[];
// enrollmentId -> marks actually posted for it
const postedMarks: Record<string, MarksInput> = {};

async function removeTestCourse() {
  const course = await prisma.course.findUnique({ where: { code: COURSE_CODE } });
  if (!course) return;
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    select: { id: true },
  });
  await prisma.result.deleteMany({
    where: { enrollmentId: { in: enrollments.map((e) => e.id) } },
  });
  await prisma.enrollment.deleteMany({ where: { courseId: course.id } });
  await prisma.courseResultStatus.deleteMany({ where: { courseId: course.id } });
  await prisma.course.delete({ where: { id: course.id } });
}

describe("Marks entry & approval workflow API", () => {
  beforeAll(async () => {
    await removeTestCourse();
    students = await prisma.student.findMany({
      where: { studentId: { in: STUDENT_IDS } },
      select: { id: true, studentId: true },
      orderBy: { studentId: "asc" },
    });
    expect(students).toHaveLength(3);
  });

  afterAll(async () => {
    // Drop the semester GPAs the approval step derived from the test course,
    // then the course itself, so the seeded database is left as we found it.
    await prisma.semesterGPA.deleteMany({
      where: { studentId: { in: students.map((s) => s.id) }, semester: COURSE_SEMESTER },
    });
    await removeTestCourse();
    await prisma.$disconnect();
  });

  it("TC-22: admin can create a course and enroll students in it", async () => {
    const department = await prisma.department.findUnique({ where: { name: "CSE" } });
    const program = await prisma.program.findUnique({ where: { name: "SWE" } });
    const teacher = await prisma.teacher.findFirst();
    expect(department && program && teacher).toBeTruthy();

    const created = await postJson("/api/admin/courses", {
      name: "Software Quality Assurance Lab",
      code: COURSE_CODE,
      credit: 3,
      semester: COURSE_SEMESTER,
      departmentId: department!.id,
      programId: program!.id,
      teacherId: teacher!.id,
    });
    expect(created.status).toBe(200);
    courseId = created.body.course.id;
    credit = created.body.course.credit;

    const enrolled = await postJson(`/api/admin/courses/${courseId}/enroll`, {
      studentIds: students.map((s) => s.id),
    });
    expect(enrolled.status).toBe(200);

    const enrollments = await prisma.enrollment.findMany({ where: { courseId } });
    expect(enrollments).toHaveLength(3);
    expect(new Set(enrollments.map((e) => e.studentId))).toEqual(
      new Set(students.map((s) => s.id))
    );
  });

  it("TC-23: saving marks as draft computes results per the grading spec and sets status DRAFT", async () => {
    const { body } = await getJson(`/api/teacher/courses/${courseId}/results`);
    const enrollments: { id: string; student: { studentId: string } }[] = body.enrollments;
    expect(enrollments).toHaveLength(3);

    const marks: Record<string, MarksInput> = {};
    for (const enr of enrollments) {
      const idx = STUDENT_IDS.indexOf(enr.student.studentId);
      marks[enr.id] = MARKS[idx];
      postedMarks[enr.id] = MARKS[idx];
    }

    const saved = await postJson(`/api/teacher/courses/${courseId}/results`, {
      marks,
      submit: false,
    });
    expect(saved.status).toBe(200);

    const after = await getJson(`/api/teacher/courses/${courseId}/results`);
    for (const enr of after.body.enrollments) {
      const expected = computeCourseResult(credit, postedMarks[enr.id]);
      const result = enr.results[0];
      expect(result.total).toBeCloseTo(expected.total, 9);
      expect(result.grade).toBe(expected.grade);
      expect(result.gradePoint).toBeCloseTo(expected.gradePoint, 9);
    }

    const status = await getJson(`/api/teacher/courses/${courseId}/results/status`);
    expect(status.body.status).toBe("DRAFT");
  });

  it("TC-24: submitting marks sets status SUBMITTED and the course appears in the admin queue", async () => {
    const submitted = await postJson(`/api/teacher/courses/${courseId}/results`, {
      marks: postedMarks,
      submit: true,
    });
    expect(submitted.status).toBe(200);

    const status = await getJson(`/api/teacher/courses/${courseId}/results/status`);
    expect(status.body.status).toBe("SUBMITTED");

    const queue = await getJson("/api/admin/results");
    const entry = queue.body.courses.find((c: { id: string }) => c.id === courseId);
    expect(entry).toBeDefined();
    expect(entry.status).toBe("Submitted");
  });

  it("TC-25: rejecting a submission reverts status to DRAFT and stores the rejection reason", async () => {
    const missingReason = await postJson("/api/admin/results/reject", { courseId });
    expect(missingReason.status).toBe(400);

    const reason = "Quiz 3 marks look inconsistent — please recheck.";
    const rejected = await postJson("/api/admin/results/reject", { courseId, reason });
    expect(rejected.status).toBe(200);

    const status = await getJson(`/api/teacher/courses/${courseId}/results/status`);
    expect(status.body.status).toBe("DRAFT");
    expect(status.body.rejectionReason).toBe(reason);
  });

  it("TC-26: approving a submission sets status APPROVED and upserts the semester GPA", async () => {
    const resubmitted = await postJson(`/api/teacher/courses/${courseId}/results`, {
      marks: postedMarks,
      submit: true,
    });
    expect(resubmitted.status).toBe(200);

    const approved = await postJson("/api/admin/results", { courseId });
    expect(approved.status).toBe(200);
    expect(approved.body.success).toBe(true);

    const status = await getJson(`/api/teacher/courses/${courseId}/results/status`);
    expect(status.body.status).toBe("APPROVED");

    for (const student of students) {
      const idx = STUDENT_IDS.indexOf(student.studentId);
      const expected = computeCourseResult(credit, MARKS[idx]);
      const row = await prisma.semesterGPA.findUnique({
        where: { studentId_semester: { studentId: student.id, semester: COURSE_SEMESTER } },
      });
      expect(row).not.toBeNull();
      expect(row!.gpa).toBeCloseTo(expected.gradePoint, 9);
    }
  });

  it("TC-27: result PDF endpoint returns a valid PDF document", async () => {
    const res = await fetch(`${BASE}/api/teacher/courses/${courseId}/results/pdf?type=draft`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/pdf");
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(bytes.length).toBeGreaterThan(1000);
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe("%PDF-");
  });
});
