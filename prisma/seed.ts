import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Deterministic PRNG so re-running the seed produces the same marks
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// Mirrors the grading logic in app/api/teacher/courses/[courseId]/results/route.ts
function computeResult(
  credit: number,
  m: {
    attendance: number;
    quiz1: number;
    quiz2: number;
    quiz3: number;
    quiz4: number;
    midterm: number;
    final: number;
  }
) {
  const totalMark = credit * 100;
  const attendanceMax = totalMark * 0.1;
  const quizMax = 3 * credit * 100 * 0.05;
  const midtermMax = totalMark * 0.25;
  const finalMax = totalMark * 0.5;

  let attendanceMark = 0;
  if (m.attendance >= 95) attendanceMark = attendanceMax;
  else if (m.attendance >= 90) attendanceMark = attendanceMax * 0.8;
  else if (m.attendance >= 80) attendanceMark = attendanceMax * 0.4;
  else if (m.attendance >= 75) attendanceMark = attendanceMax * 0.2;

  const quizzes = [m.quiz1, m.quiz2, m.quiz3, m.quiz4]
    .sort((a, b) => b - a)
    .slice(0, 3);
  const quizMark = Math.min(
    quizzes.reduce((a, b) => a + b, 0),
    quizMax
  );
  const midtermMark = Math.min(m.midterm, midtermMax);
  const finalMark = Math.min(m.final, finalMax);
  const total = attendanceMark + quizMark + midtermMark + finalMark;

  let grade = "F";
  let gradePoint = 0;
  const percent = (total / totalMark) * 100;
  if (percent >= 80) [grade, gradePoint] = ["A+", 4.0];
  else if (percent >= 75) [grade, gradePoint] = ["A", 3.75];
  else if (percent >= 70) [grade, gradePoint] = ["A-", 3.5];
  else if (percent >= 65) [grade, gradePoint] = ["B+", 3.25];
  else if (percent >= 60) [grade, gradePoint] = ["B", 3.0];
  else if (percent >= 55) [grade, gradePoint] = ["B-", 2.75];
  else if (percent >= 50) [grade, gradePoint] = ["C+", 2.5];
  else if (percent >= 45) [grade, gradePoint] = ["C", 2.25];
  else if (percent >= 40) [grade, gradePoint] = ["D", 2.0];

  return { ...m, total, grade, gradePoint };
}

// Generate believable marks for a student in a course, scaled by ability (0..1)
function generateMarks(credit: number, ability: number, seed: string) {
  const rand = seededRandom(seed);
  const jitter = (range: number) => (rand() - 0.5) * 2 * range;
  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, v));
  const score = (max: number) =>
    Math.round(max * clamp(ability + jitter(0.12), 0, 1) * 10) / 10;

  const quizSingleMax = credit * 100 * 0.05;
  return {
    attendance: Math.round(clamp(70 + ability * 30 + jitter(6), 60, 100)),
    quiz1: score(quizSingleMax),
    quiz2: score(quizSingleMax),
    quiz3: score(quizSingleMax),
    quiz4: score(quizSingleMax),
    midterm: score(credit * 100 * 0.25),
    final: score(credit * 100 * 0.5),
  };
}

async function main() {
  // 1. Departments
  const departmentNames = ["CSE", "EEE", "MPE", "CEE", "BTM", "TVE"];
  const departments = {} as Record<string, { id: string }>;
  for (const name of departmentNames) {
    departments[name] = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Programs
  const departmentsWithPrograms = [
    { name: "CSE", programs: ["CSE", "SWE"] },
    { name: "MPE", programs: ["ME", "IPE"] },
    { name: "EEE", programs: ["EEE"] },
    { name: "CEE", programs: ["CE"] },
    { name: "BTM", programs: ["BTM"] },
    { name: "TVE", programs: ["TE"] },
  ];
  const programs = {} as Record<string, { id: string }>;
  for (const dept of departmentsWithPrograms) {
    for (const prog of dept.programs) {
      programs[prog] = await prisma.program.upsert({
        where: { name: prog },
        update: {},
        create: {
          name: prog,
          department: { connect: { id: departments[dept.name].id } },
        },
      });
    }
  }

  // 3. Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@iut-dhaka.edu" },
    update: {},
    create: {
      email: "admin@iut-dhaka.edu",
      password: adminPassword,
      role: "ADMIN",
      mustChangePassword: false,
    },
  });

  // 4. Teachers
  const teacherPassword = await bcrypt.hash("Teacher*123", 10);
  const teacherList = [
    {
      name: "Ajwad Abrar",
      code: "AA",
      email: "ajwadabrar@iut-dhaka.edu",
      designation: "Lecturer",
      dept: "CSE",
      password: await bcrypt.hash("Ajwad*123", 10),
    },
    {
      name: "Farhan Sadique",
      code: "FS",
      email: "farhansadique@iut-dhaka.edu",
      designation: "Assistant Professor",
      dept: "CSE",
      password: teacherPassword,
    },
    {
      name: "Nusrat Jahan",
      code: "NJ",
      email: "nusratjahan@iut-dhaka.edu",
      designation: "Associate Professor",
      dept: "CSE",
      password: teacherPassword,
    },
    {
      name: "Mahmudur Rahman",
      code: "MR",
      email: "mahmudurrahman@iut-dhaka.edu",
      designation: "Professor",
      dept: "CSE",
      password: teacherPassword,
    },
    {
      name: "Sabrina Khan",
      code: "SK",
      email: "sabrinakhan@iut-dhaka.edu",
      designation: "Lecturer",
      dept: "CSE",
      password: teacherPassword,
    },
  ];
  const teachers = {} as Record<string, { id: string }>;
  for (const t of teacherList) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        password: t.password,
        role: "TEACHER",
        mustChangePassword: true,
      },
    });
    teachers[t.code] = await prisma.teacher.upsert({
      where: { code: t.code },
      update: {},
      create: {
        userId: user.id,
        name: t.name,
        code: t.code,
        departmentId: departments[t.dept].id,
        email: t.email,
        designation: t.designation,
      },
    });
  }

  // 5. Courses (SWE program, semesters 1 and 2)
  const courseCatalog = [
    // Semester 1
    { code: "SWE 4101", name: "Structured Programming", credit: 3, semester: 1, teacher: "AA" },
    { code: "SWE 4102", name: "Structured Programming Lab", credit: 1.5, semester: 1, teacher: "AA" },
    { code: "MATH 4141", name: "Differential and Integral Calculus", credit: 3, semester: 1, teacher: "NJ" },
    { code: "PHY 4141", name: "Physics I", credit: 3, semester: 1, teacher: "MR" },
    { code: "HUM 4141", name: "Technical English", credit: 3, semester: 1, teacher: "SK" },
    // Semester 2
    { code: "SWE 4201", name: "Object Oriented Programming", credit: 3, semester: 2, teacher: "FS" },
    { code: "SWE 4202", name: "Object Oriented Programming Lab", credit: 1.5, semester: 2, teacher: "FS" },
    { code: "MATH 4241", name: "Linear Algebra and Coordinate Geometry", credit: 3, semester: 2, teacher: "NJ" },
    { code: "CSE 4203", name: "Discrete Mathematics", credit: 3, semester: 2, teacher: "MR" },
  ];
  const courses = {} as Record<string, { id: string; credit: number; semester: number }>;
  for (const c of courseCatalog) {
    courses[c.code] = await prisma.course.upsert({
      where: { code: c.code },
      update: { teacherId: teachers[c.teacher].id },
      create: {
        code: c.code,
        name: c.name,
        credit: c.credit,
        semester: c.semester,
        departmentId: departments["CSE"].id,
        programId: programs["SWE"].id,
        teacherId: teachers[c.teacher].id,
      },
    });
  }

  // 6. Students (SWE, batch 2025, currently in semester 2)
  const studentPassword = await bcrypt.hash("Student*123", 10);
  const studentList = [
    {
      studentId: "20250001",
      name: "Nafis Reza",
      email: "nafisreza@iut-dhaka.edu",
      ability: 0.9,
      password: await bcrypt.hash("Nafis*123", 10),
    },
    { studentId: "20250002", name: "Ayesha Rahman", email: "ayesharahman@iut-dhaka.edu", ability: 0.85, password: studentPassword },
    { studentId: "20250003", name: "Tanvir Hasan", email: "tanvirhasan@iut-dhaka.edu", ability: 0.75, password: studentPassword },
    { studentId: "20250004", name: "Mehedi Chowdhury", email: "mehedichowdhury@iut-dhaka.edu", ability: 0.65, password: studentPassword },
    { studentId: "20250005", name: "Sadia Islam", email: "sadiaislam@iut-dhaka.edu", ability: 0.55, password: studentPassword },
    { studentId: "20250006", name: "Rafiul Karim", email: "rafiulkarim@iut-dhaka.edu", ability: 0.45, password: studentPassword },
  ];
  const students = [] as { id: string; studentId: string; ability: number }[];
  for (const s of studentList) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: s.password,
        role: "STUDENT",
        mustChangePassword: true,
      },
    });
    const student = await prisma.student.upsert({
      where: { studentId: s.studentId },
      update: { currentSemester: 2 },
      create: {
        userId: user.id,
        studentId: s.studentId,
        name: s.name,
        departmentId: departments["CSE"].id,
        programId: programs["SWE"].id,
        batch: "2025",
        currentSemester: 2,
        email: s.email,
      },
    });
    students.push({ id: student.id, studentId: s.studentId, ability: s.ability });
  }

  // 7. Enrollments + results
  // Semester 1: results entered and APPROVED (visible to students).
  // Semester 2: SWE 4201 results SUBMITTED (awaiting admin approval),
  //             MATH 4241 results still DRAFT, remaining courses not graded yet.
  const resultsPlan: Record<string, "APPROVED" | "SUBMITTED" | "DRAFT" | null> = {
    "SWE 4101": "APPROVED",
    "SWE 4102": "APPROVED",
    "MATH 4141": "APPROVED",
    "PHY 4141": "APPROVED",
    "HUM 4141": "APPROVED",
    "SWE 4201": "SUBMITTED",
    "SWE 4202": null,
    "MATH 4241": "DRAFT",
    "CSE 4203": null,
  };

  for (const c of courseCatalog) {
    const course = courses[c.code];
    const status = resultsPlan[c.code];

    for (const student of students) {
      let enrollment = await prisma.enrollment.findFirst({
        where: { studentId: student.id, courseId: course.id },
      });
      if (!enrollment) {
        enrollment = await prisma.enrollment.create({
          data: { studentId: student.id, courseId: course.id },
        });
      }

      if (status) {
        const marks = generateMarks(
          c.credit,
          student.ability,
          `${student.studentId}:${c.code}`
        );
        const result = computeResult(c.credit, marks);
        const existing = await prisma.result.findFirst({
          where: { enrollmentId: enrollment.id },
        });
        if (existing) {
          await prisma.result.update({ where: { id: existing.id }, data: result });
        } else {
          await prisma.result.create({
            data: { enrollmentId: enrollment.id, ...result },
          });
        }
      }
    }

    if (status) {
      const existingStatus = await prisma.courseResultStatus.findFirst({
        where: { courseId: course.id, semester: c.semester },
      });
      if (existingStatus) {
        await prisma.courseResultStatus.update({
          where: { id: existingStatus.id },
          data: { status, rejectionReason: null },
        });
      } else {
        await prisma.courseResultStatus.create({
          data: { courseId: course.id, semester: c.semester, status },
        });
      }
    }
  }

  // 8. Semester GPAs (semester 1 — the approved semester), credit-weighted
  for (const student of students) {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id, course: { semester: 1 } },
      include: { course: true, results: true },
    });
    let totalCredits = 0;
    let weightedSum = 0;
    for (const enr of enrollments) {
      const result = enr.results[0];
      if (!result) continue;
      totalCredits += enr.course.credit;
      weightedSum += result.gradePoint * enr.course.credit;
    }
    if (totalCredits > 0) {
      const gpa = weightedSum / totalCredits;
      await prisma.semesterGPA.upsert({
        where: { studentId_semester: { studentId: student.id, semester: 1 } },
        update: { gpa },
        create: { studentId: student.id, semester: 1, gpa },
      });
    }
  }

  console.log("Seed complete:");
  console.log("  - 6 departments, 8 programs");
  console.log("  - Admin: admin@iut-dhaka.edu / admin123");
  console.log("  - 5 teachers (Teacher*123, Ajwad: Ajwad*123)");
  console.log("  - 9 SWE courses (semesters 1-2)");
  console.log("  - 6 students, batch 2025 (Student*123, Nafis: Nafis*123)");
  console.log("  - Semester 1 results APPROVED (+ semester GPAs)");
  console.log("  - SWE 4201 results SUBMITTED, MATH 4241 results DRAFT");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
