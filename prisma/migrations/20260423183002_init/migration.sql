/*
  Warnings:

  - You are about to drop the column `balance_due_data` on the `account` table. All the data in the column will be lost.
  - Added the required column `external_id` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency_code` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_id` to the `transaction` table without a default value. This is not possible if the table is not empty.

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
    "balance" REAL NOT NULL,
    "owner" TEXT,
    "connector_name" TEXT NOT NULL,
    "connector_image_url" TEXT NOT NULL,
    "credit_limit" REAL,
    "available_credit_limit" REAL,
    "balance_due_date" DATETIME,
    "minimum_payment" REAL,
    "synced_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_account" ("available_credit_limit", "balance", "connector_image_url", "connector_name", "created_at", "credit_limit", "currency_code", "id", "minimum_payment", "name", "number", "owner", "subtype", "synced_at", "type", "updated_at", "user_id") SELECT "available_credit_limit", "balance", "connector_image_url", "connector_name", "created_at", "credit_limit", "currency_code", "id", "minimum_payment", "name", "number", "owner", "subtype", "synced_at", "type", "updated_at", "user_id" FROM "account";
DROP TABLE "account";
ALTER TABLE "new_account" RENAME TO "account";
CREATE UNIQUE INDEX "account_external_id_key" ON "account"("external_id");
CREATE TABLE "new_transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "account_id" INTEGER NOT NULL,
    "external_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency_code" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "original_category" TEXT,
    "category" TEXT NOT NULL,
    "installment_number" INTEGER,
    "installment_total" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_transaction" ("account_id", "amount", "category", "created_at", "date", "description", "id", "installment_number", "installment_total", "original_category", "status", "type") SELECT "account_id", "amount", "category", "created_at", "date", "description", "id", "installment_number", "installment_total", "original_category", "status", "type" FROM "transaction";
DROP TABLE "transaction";
ALTER TABLE "new_transaction" RENAME TO "transaction";
CREATE UNIQUE INDEX "transaction_external_id_key" ON "transaction"("external_id");
CREATE INDEX "transaction_account_id_idx" ON "transaction"("account_id");
CREATE INDEX "transaction_date_idx" ON "transaction"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
