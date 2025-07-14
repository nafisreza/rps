/*
  Warnings:

  - Made the column `programId` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `programId` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_programId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_programId_fkey";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "programId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "programId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
