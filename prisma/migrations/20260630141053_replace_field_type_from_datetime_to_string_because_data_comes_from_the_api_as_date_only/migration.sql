/*
  Warnings:

  - Made the column `balance_due_date` on table `account` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "external_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "currency_code" TEXT NOT NULL,
    "balance" TEXT NOT NULL,
    "owner" TEXT,
    "connector_name" TEXT,
    "connector_image_url" TEXT,
    "credit_limit" REAL,
    "available_credit_limit" REAL,
    "balance_due_date" TEXT NOT NULL,
    "minimum_payment" REAL,
    "synced_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_account" ("available_credit_limit", "balance", "balance_due_date", "connector_image_url", "connector_name", "created_at", "credit_limit", "currency_code", "external_id", "id", "minimum_payment", "name", "number", "owner", "subtype", "synced_at", "type", "updated_at", "user_id") SELECT "available_credit_limit", "balance", "balance_due_date", "connector_image_url", "connector_name", "created_at", "credit_limit", "currency_code", "external_id", "id", "minimum_payment", "name", "number", "owner", "subtype", "synced_at", "type", "updated_at", "user_id" FROM "account";
DROP TABLE "account";
ALTER TABLE "new_account" RENAME TO "account";
CREATE UNIQUE INDEX "account_external_id_key" ON "account"("external_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
