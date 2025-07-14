import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const departmentsWithPrograms = [
  { name: 'CSE', programs: ['CSE', 'SWE'] },
  { name: 'MPE', programs: ['ME', 'IPE'] },
  { name: 'EEE', programs: ['EEE'] },
  { name: 'CEE', programs: ['CE'] },
  { name: 'BTM', programs: ['BTM'] },
  { name: 'TVE', programs: ['TE'] },
];

async function main() {
  for (const dept of departmentsWithPrograms) {
    // Find department by name
    const department = await prisma.department.findFirst({
      where: { name: dept.name },
    });
    if (!department) {
      console.error(`Department not found: ${dept.name}`);
      continue;
    }
    for (const prog of dept.programs) {
      // Check if program already exists
      const existing = await prisma.program.findFirst({
        where: { name: prog, departmentId: department.id },
      });
      if (existing) {
        console.log(`Program already exists: ${prog} in ${dept.name}`);
        continue;
      }
      await prisma.program.create({
        data: {
          name: prog,
          departmentId: department.id,
        },
      });
      console.log(`Created program: ${prog} in ${dept.name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
