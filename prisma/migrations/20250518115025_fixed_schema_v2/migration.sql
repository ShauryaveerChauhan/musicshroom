/*
  Warnings:

  - You are about to drop the column `streamId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "streamId",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'EndUser';
