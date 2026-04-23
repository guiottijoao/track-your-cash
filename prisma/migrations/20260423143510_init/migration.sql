/*
  Warnings:

  - You are about to drop the `pluggy_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `display_name` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `pluggy_account_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `pluggy_category` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `pluggy_transaction_id` on the `transaction` table. All the data in the column will be lost.
  - Added the required column `connector_image_url` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connector_name` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency_code` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtype` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `synced_at` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_category` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "pluggy_item";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "currency_code" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "owner" TEXT NOT NULL,
    "connector_name" TEXT NOT NULL,
    "connector_image_url" TEXT NOT NULL,
    "credit_limit" REAL,
    "available_credit_limit" REAL,
    "balance_due_data" DATETIME,
    "minimum_payment" REAL,
    "synced_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_account" ("balance", "id", "name", "type") SELECT "balance", "id", "name", "type" FROM "account";
DROP TABLE "account";
ALTER TABLE "new_account" RENAME TO "account";
CREATE TABLE "new_transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "account_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "original_category" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "installment_number" INTEGER,
    "installment_total" INTEGER,
    "created_at" DATETIME NOT NULL,
    CONSTRAINT "transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_transaction" ("amount", "category", "date", "description", "id", "type") SELECT "amount", "category", "date", "description", "id", "type" FROM "transaction";
DROP TABLE "transaction";
ALTER TABLE "new_transaction" RENAME TO "transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
