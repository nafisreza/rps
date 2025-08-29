import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Find all students
  const students = await prisma.student.findMany();
  for (const student of students) {
    // Find all enrollments for this student, grouped by semester
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: { course: true, results: true },
    });
    const semesterMap: Record<number, typeof enrollments> = {};
    for (const enr of enrollments) {
      const semester = enr.course.semester;
      if (!semesterMap[semester]) semesterMap[semester] = [];
      semesterMap[semester].push(enr);
    }
    // For each semester, calculate GPA and upsert
    for (const [semesterStr, enrList] of Object.entries(semesterMap)) {
      const semester = Number(semesterStr);
      let totalCredits = 0;
      let weightedSum = 0;
      for (const enr of enrList) {
        const course = enr.course;
        const result = enr.results[0];
        if (!result || typeof result.gradePoint !== "number" || typeof course.credit !== "number") continue;
        totalCredits += course.credit;
        weightedSum += result.gradePoint * course.credit;
      }
      const gpa = totalCredits > 0 ? weightedSum / totalCredits : null;
      if (gpa !== null) {
        await prisma.semesterGPA.upsert({
          where: { studentId_semester: { studentId: student.id, semester } },
          update: { gpa },
          create: { studentId: student.id, semester, gpa },
        });
        console.log(`Upserted GPA for student ${student.id} semester ${semester}: ${gpa.toFixed(2)}`);
      }
    }
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
