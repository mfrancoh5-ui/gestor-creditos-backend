-- CreateTable
CREATE TABLE `Cliente` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `dpi` VARCHAR(25) NULL,
    `telefono` VARCHAR(20) NULL,
    `email` VARCHAR(150) NULL,
    `direccion` VARCHAR(255) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cliente_dpi_key`(`dpi`),
    UNIQUE INDEX `Cliente_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Credito` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `clienteId` BIGINT NOT NULL,
    `principal` DECIMAL(12, 2) NOT NULL,
    `duracionDias` INTEGER NOT NULL,
    `frecuencia` ENUM('DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'ANUAL') NOT NULL DEFAULT 'DIARIO',
    `interesTipo` ENUM('PORCENTAJE', 'MONTO_FIJO') NOT NULL,
    `interesValor` DECIMAL(12, 2) NOT NULL,
    `interesTotal` DECIMAL(12, 2) NOT NULL,
    `totalPagar` DECIMAL(12, 2) NOT NULL,
    `cuotaValor` DECIMAL(12, 2) NOT NULL,
    `fechaInicio` DATE NOT NULL,
    `estado` ENUM('VIGENTE', 'CANCELADO', 'MORA') NOT NULL DEFAULT 'VIGENTE',
    `saldo` DECIMAL(12, 2) NOT NULL,
    `nota` VARCHAR(255) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    INDEX `Credito_clienteId_idx`(`clienteId`),
    INDEX `Credito_estado_idx`(`estado`),
    INDEX `Credito_fechaInicio_idx`(`fechaInicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cuota` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `creditoId` BIGINT NOT NULL,
    `numero` INTEGER NOT NULL,
    `vencimiento` DATE NOT NULL,
    `monto` DECIMAL(12, 2) NOT NULL,
    `saldo` DECIMAL(12, 2) NOT NULL,
    `estado` ENUM('PENDIENTE', 'PAGADA', 'MORA') NOT NULL DEFAULT 'PENDIENTE',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    INDEX `Cuota_vencimiento_idx`(`vencimiento`),
    INDEX `Cuota_estado_idx`(`estado`),
    UNIQUE INDEX `Cuota_creditoId_numero_key`(`creditoId`, `numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pago` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `cuotaId` BIGINT NOT NULL,
    `monto` DECIMAL(12, 2) NOT NULL,
    `metodo` ENUM('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO') NOT NULL DEFAULT 'EFECTIVO',
    `referencia` VARCHAR(60) NULL,
    `nota` VARCHAR(255) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Pago_cuotaId_idx`(`cuotaId`),
    INDEX `Pago_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Credito` ADD CONSTRAINT `Credito_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Cuota` ADD CONSTRAINT `Cuota_creditoId_fkey` FOREIGN KEY (`creditoId`) REFERENCES `Credito`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_cuotaId_fkey` FOREIGN KEY (`cuotaId`) REFERENCES `Cuota`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
