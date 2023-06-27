-- CreateTable
CREATE TABLE `Client` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `accountNumber` INTEGER NOT NULL,
    `creationDate` DATETIME(3) NOT NULL,
    `updateDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Client_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `number` INTEGER NOT NULL,
    `balance` DECIMAL(65, 30) NOT NULL,

    UNIQUE INDEX `Account_number_key`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(65, 30) NOT NULL,
    `type` ENUM('DEPOSITO', 'SAQUE', 'TRANSFERENCIA') NOT NULL,
    `originAccountNumber` INTEGER NOT NULL,
    `secondaryAccountNumber` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_accountNumber_fkey` FOREIGN KEY (`accountNumber`) REFERENCES `Account`(`number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_originAccountNumber_fkey` FOREIGN KEY (`originAccountNumber`) REFERENCES `Account`(`number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_secondaryAccountNumber_fkey` FOREIGN KEY (`secondaryAccountNumber`) REFERENCES `Account`(`number`) ON DELETE SET NULL ON UPDATE CASCADE;
