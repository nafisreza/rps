import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function autoEnroll() {
  const students = await prisma.student.findMany({
    select: { id: true, departmentId: true, programId: true, currentSemester: true },
  });
  const courses = await prisma.course.findMany({
    select: { id: true, departmentId: true, programId: true, semester: true },
  });

  let enrollmentsToCreate: { studentId: string; courseId: string }[] = [];

  for (const student of students) {
    for (const course of courses) {
      if (
        student.departmentId === course.departmentId &&
        student.programId === course.programId &&
        Number(student.currentSemester) === Number(course.semester)
      ) {
        enrollmentsToCreate.push({ studentId: student.id, courseId: course.id });
      }
    }
  }

  // Remove duplicates and already existing enrollments
  const existing = await prisma.enrollment.findMany({
    select: { studentId: true, courseId: true },
  });
  const existingSet = new Set(existing.map(e => `${e.studentId}_${e.courseId}`));
  enrollmentsToCreate = enrollmentsToCreate.filter(e => !existingSet.has(`${e.studentId}_${e.courseId}`));

  if (enrollmentsToCreate.length > 0) {
    await prisma.enrollment.createMany({ data: enrollmentsToCreate, skipDuplicates: true });
    console.log(`Enrolled ${enrollmentsToCreate.length} students in courses.`);
  } else {
    console.log("No new enrollments needed.");
  }
}

autoEnroll().then(() => prisma.$disconnect());
