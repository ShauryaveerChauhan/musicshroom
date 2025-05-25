-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Code" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_Code_key" ON "Room"("Code");
