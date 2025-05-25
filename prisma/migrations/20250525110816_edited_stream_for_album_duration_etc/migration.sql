/*
  Warnings:

  - The values [Youtube] on the enum `StreamType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StreamType_new" AS ENUM ('Spotify', 'YouTube');
ALTER TABLE "Stream" ALTER COLUMN "type" TYPE "StreamType_new" USING ("type"::text::"StreamType_new");
ALTER TYPE "StreamType" RENAME TO "StreamType_old";
ALTER TYPE "StreamType_new" RENAME TO "StreamType";
DROP TYPE "StreamType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "album" TEXT,
ADD COLUMN     "artist" TEXT,
ADD COLUMN     "durationMs" INTEGER;
