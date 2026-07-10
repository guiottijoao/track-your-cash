/*
  Warnings:

  - Added the required column `installment_due_date` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "installment_due_date",
ADD COLUMN     "installment_due_date" TIMESTAMP(3) NOT NULL;
