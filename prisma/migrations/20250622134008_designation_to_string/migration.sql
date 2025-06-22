/*
  Warnings:

  - Changed the type of `designation` on the `Teacher` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
*/
-- AlterTable
ALTER TABLE "Teacher"
  ALTER COLUMN "designation" TYPE TEXT USING "designation"::text;

-- DropEnum
DROP TYPE "Designation";
