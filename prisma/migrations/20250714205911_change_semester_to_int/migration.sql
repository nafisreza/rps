/*
  Warnings:

  - Changed the type of `semester` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
-- Add a temporary column
ALTER TABLE "Course" ADD COLUMN "semester_temp" INTEGER;

-- Copy and convert data from string to integer
UPDATE "Course" SET "semester_temp" = CAST("semester" AS INTEGER);

-- Drop the old column
ALTER TABLE "Course" DROP COLUMN "semester";

-- Rename the temp column to semester
ALTER TABLE "Course" RENAME COLUMN "semester_temp" TO "semester";
