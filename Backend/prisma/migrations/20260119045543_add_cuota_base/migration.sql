/*
  Warnings:

  - Added the required column `cuotaBase` to the `Credito` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `credito` ADD COLUMN `cuotaBase` DECIMAL(12, 2) NOT NULL;
