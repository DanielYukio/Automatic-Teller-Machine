-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `accountNumber` BIGINT NOT NULL,
    `accontBalance` DECIMAL(65, 30) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL,
    `updateDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Client_email_key`(`email`),
    UNIQUE INDEX `Client_accountNumber_key`(`accountNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` DECIMAL(65, 30) NOT NULL,
    `type` ENUM('DEPOSITO', 'SAQUE', 'TRANSFERENCIA') NOT NULL,
    `originClientId` INTEGER NOT NULL,
    `secondaryClientId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_originClientId_fkey` FOREIGN KEY (`originClientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_secondaryClientId_fkey` FOREIGN KEY (`secondaryClientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
