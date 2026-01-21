/*
  Warnings:

  - The primary key for the `cliente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actualizadoEn` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `dpi` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `cliente` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `credito` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actualizadoEn` on the `credito` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `credito` table. All the data in the column will be lost.
  - You are about to drop the column `cuotaValor` on the `credito` table. All the data in the column will be lost.
  - You are about to drop the column `duracionDias` on the `credito` table. All the data in the column will be lost.
  - You are about to drop the column `interesTipo` on the `credito` table. All the data in the column will be lost.
  - You are about to drop the column `interesTotal` on the `credito` table. All the data in the column will be lost.
  - You are about to drop the column `interesValor` on the `credito` table. All the data in the column will be lost.
  - You are about to drop the column `nota` on the `credito` table. All the data in the column will be lost.
  - You are about to drop the column `principal` on the `credito` table. All the data in the column will be lost.
  - You are about to drop the column `saldo` on the `credito` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `credito` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `clienteId` on the `credito` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `frecuencia` on the `credito` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.
  - You are about to alter the column `estado` on the `credito` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `Enum(EnumId(1))`.
  - The primary key for the `cuota` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actualizadoEn` on the `cuota` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `cuota` table. All the data in the column will be lost.
  - You are about to drop the column `vencimiento` on the `cuota` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `cuota` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `creditoId` on the `cuota` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `estado` on the `cuota` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(2))`.
  - The primary key for the `pago` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fecha` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `metodo` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `referencia` on the `pago` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `pago` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `cuotaId` on the `pago` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - A unique constraint covering the columns `[dni]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellidos` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaCulminacion` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montoPrestado` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroCuotas` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tasaInteresPct` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalInteres` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaVenc` to the `Cuota` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Cuota` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `credito` DROP FOREIGN KEY `Credito_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `cuota` DROP FOREIGN KEY `Cuota_creditoId_fkey`;

-- DropForeignKey
ALTER TABLE `pago` DROP FOREIGN KEY `Pago_cuotaId_fkey`;

-- DropIndex
DROP INDEX `Cliente_dpi_key` ON `cliente`;

-- DropIndex
DROP INDEX `Cliente_email_key` ON `cliente`;

-- DropIndex
DROP INDEX `Cuota_vencimiento_idx` ON `cuota`;

-- DropIndex
DROP INDEX `Pago_fecha_idx` ON `pago`;

-- AlterTable
ALTER TABLE `cliente` DROP PRIMARY KEY,
    DROP COLUMN `actualizadoEn`,
    DROP COLUMN `creadoEn`,
    DROP COLUMN `dpi`,
    DROP COLUMN `email`,
    DROP COLUMN `estado`,
    DROP COLUMN `nombre`,
    ADD COLUMN `apellidos` VARCHAR(120) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dni` VARCHAR(30) NULL,
    ADD COLUMN `nombres` VARCHAR(120) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `telefono` VARCHAR(30) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `credito` DROP PRIMARY KEY,
    DROP COLUMN `actualizadoEn`,
    DROP COLUMN `creadoEn`,
    DROP COLUMN `cuotaValor`,
    DROP COLUMN `duracionDias`,
    DROP COLUMN `interesTipo`,
    DROP COLUMN `interesTotal`,
    DROP COLUMN `interesValor`,
    DROP COLUMN `nota`,
    DROP COLUMN `principal`,
    DROP COLUMN `saldo`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fechaCulminacion` DATETIME(3) NOT NULL,
    ADD COLUMN `montoPrestado` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `numeroCuotas` INTEGER NOT NULL,
    ADD COLUMN `observacion` VARCHAR(255) NULL,
    ADD COLUMN `tasaInteresPct` DECIMAL(6, 2) NOT NULL,
    ADD COLUMN `totalInteres` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `clienteId` INTEGER NOT NULL,
    MODIFY `frecuencia` ENUM('DAILY', 'BIWEEKLY', 'MONTHLY', 'YEARLY') NOT NULL,
    MODIFY `fechaInicio` DATETIME(3) NOT NULL,
    MODIFY `estado` ENUM('ACTIVE', 'PAID', 'LATE', 'CANCELED') NOT NULL DEFAULT 'ACTIVE',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `cuota` DROP PRIMARY KEY,
    DROP COLUMN `actualizadoEn`,
    DROP COLUMN `creadoEn`,
    DROP COLUMN `vencimiento`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fechaVenc` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `creditoId` INTEGER NOT NULL,
    MODIFY `estado` ENUM('PENDING', 'PARTIAL', 'PAID', 'LATE') NOT NULL DEFAULT 'PENDING',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `pago` DROP PRIMARY KEY,
    DROP COLUMN `fecha`,
    DROP COLUMN `metodo`,
    DROP COLUMN `referencia`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fechaPago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `cuotaId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Cliente_dni_key` ON `Cliente`(`dni`);

-- CreateIndex
CREATE INDEX `Cuota_creditoId_idx` ON `Cuota`(`creditoId`);

-- CreateIndex
CREATE INDEX `Cuota_fechaVenc_idx` ON `Cuota`(`fechaVenc`);

-- CreateIndex
CREATE INDEX `Pago_fechaPago_idx` ON `Pago`(`fechaPago`);

-- AddForeignKey
ALTER TABLE `Credito` ADD CONSTRAINT `Credito_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cuota` ADD CONSTRAINT `Cuota_creditoId_fkey` FOREIGN KEY (`creditoId`) REFERENCES `Credito`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_cuotaId_fkey` FOREIGN KEY (`cuotaId`) REFERENCES `Cuota`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
