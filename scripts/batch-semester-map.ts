// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const batchSemesterMap = {
//   2023: 2,
//   2022: 4,
//   2021: 6,
//   2020: 8,
// };

// Promote students in each batch
// for (const [batch, semester] of Object.entries(batchSemesterMap)) {
//   await prisma.student.updateMany({
//     where: { batch: Number(batch) },
//     data: { currentSemester: semester }
//   });
// }