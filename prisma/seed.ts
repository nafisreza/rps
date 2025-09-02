import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1. Create departments
  const departmentNames = ["CSE", "EEE", "MPE", "CEE", "BTM", "TVE"];
  const departments = {} as Record<string, any>;
  for (const name of departmentNames) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    departments[name] = dept;
  }

  // 2. Create programs for each department
  const departmentsWithPrograms = [
    { name: "CSE", programs: ["CSE", "SWE"] },
    { name: "MPE", programs: ["ME", "IPE"] },
    { name: "EEE", programs: ["EEE"] },
    { name: "CEE", programs: ["CE"] },
    { name: "BTM", programs: ["BTM"] },
    { name: "TVE", programs: ["TE"] },
  ];
  const programs = {} as Record<string, any>;
  for (const dept of departmentsWithPrograms) {
    const department = departments[dept.name];
    if (!department) continue;
    for (const prog of dept.programs) {
      const program = await prisma.program.upsert({
        where: { name: prog },
        update: {},
        create: {
          name: prog,
          department: { connect: { id: department.id } },
        },
      });
      programs[prog] = program;
    }
  }

  // 3. Create admin user
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

  // 4. Create a teacher
  const teacherPassword = await bcrypt.hash("Ajwad*123", 10);
  await prisma.user.upsert({
    where: { email: "ajwadabrar@iut-dhaka.edu" },
    update: {},
    create: {
      email: "ajwadabrar@iut-dhaka.edu",
      password: teacherPassword,
      role: "TEACHER",
      mustChangePassword: true,
      teacher: {
        create: {
          name: "Ajwad Abrar",
          department: { connect: { id: departments["CSE"].id } },
          email: "ajwadabrar@iut-dhaka.edu",
          designation: "Lecturer",
          code: "AA",
        },
      },
    },
  });

  // 5. Create a student (assign to CSE Dept and SWE program)
  const studentPassword = await bcrypt.hash("Nafis*123", 10);
  await prisma.user.upsert({
    where: { email: "nafisreza@iut-dhaka.edu" },
    update: {},
    create: {
      email: "nafisreza@iut-dhaka.edu",
      password: studentPassword,
      role: "STUDENT",
      mustChangePassword: true,
      student: {
        create: {
          studentId: "20250001",
          name: "Nafis Reza",
          department: { connect: { id: departments["CSE"].id } },
          program: { connect: { id: programs["SWE"].id } },
          batch: "2025",
          currentSemester: 1,
          email: "nafisreza@iut-dhaka.edu",
        },
      },
    },
  });

  console.log(
    "Seed data created: admin, departments, programs, teacher, student."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
