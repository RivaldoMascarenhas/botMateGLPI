-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "glpiTicketId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requesttypes_id" INTEGER NOT NULL,
    "urgencyText" TEXT NOT NULL,
    "userRequest" TEXT,
    "dateMod" TEXT,
    "status" INTEGER,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isClosed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Ticket" ("createdAt", "dateMod", "description", "glpiTicketId", "id", "phone", "requesttypes_id", "title", "urgencyText", "userRequest") SELECT "createdAt", "dateMod", "description", "glpiTicketId", "id", "phone", "requesttypes_id", "title", "urgencyText", "userRequest" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE UNIQUE INDEX "Ticket_glpiTicketId_key" ON "Ticket"("glpiTicketId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
