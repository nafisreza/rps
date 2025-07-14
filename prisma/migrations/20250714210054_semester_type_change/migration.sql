/*
  Warnings:

  - Made the column `semester` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "semester" SET NOT NULL;
