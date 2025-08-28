/*
  Warnings:

  - A unique constraint covering the columns `[studentId,semester]` on the table `SemesterGPA` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SemesterGPA_studentId_semester_key" ON "SemesterGPA"("studentId", "semester");
