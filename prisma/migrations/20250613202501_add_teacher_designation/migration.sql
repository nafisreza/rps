/*
  Warnings:

  - Added the required column `designation` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('PROFESSOR', 'ASSISTANT_PROFESSOR', 'ASSOCIATE_PROFESSOR', 'LECTURER');

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "designation" "Designation" NOT NULL;
