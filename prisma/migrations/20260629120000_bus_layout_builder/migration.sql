-- Bus layout builder: body type, versioned layouts, schedule snapshots

-- New enums via column definitions (MySQL)

ALTER TABLE `Bus`
  ADD COLUMN `bodyType` ENUM('SEATER', 'SLEEPER', 'SEMI_SLEEPER') NULL,
  ADD COLUMN `layoutType` ENUM('SEATER_2_2', 'SEATER_2_1', 'SLEEPER_1_1') NOT NULL DEFAULT 'SEATER_2_2',
  ADD COLUMN `hasAc` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `currentLayoutId` INTEGER NULL;

UPDATE `Bus` SET `bodyType` = 'SEATER', `hasAc` = false WHERE `type` = 'SEATER';
UPDATE `Bus` SET `bodyType` = 'SLEEPER', `hasAc` = false WHERE `type` = 'SLEEPER';
UPDATE `Bus` SET `bodyType` = 'SEMI_SLEEPER', `hasAc` = false WHERE `type` = 'SEMI_SLEEPER';
UPDATE `Bus` SET `bodyType` = 'SEATER', `hasAc` = true WHERE `type` = 'AC';
UPDATE `Bus` SET `bodyType` = 'SEATER', `hasAc` = false WHERE `type` = 'NON_AC';

UPDATE `Bus` SET `layoutType` = 'SLEEPER_1_1' WHERE `bodyType` = 'SLEEPER';
UPDATE `Bus` SET `layoutType` = 'SEATER_2_1' WHERE `bodyType` = 'SEMI_SLEEPER';

ALTER TABLE `Bus`
  MODIFY `bodyType` ENUM('SEATER', 'SLEEPER', 'SEMI_SLEEPER') NOT NULL,
  DROP COLUMN `type`;

CREATE TABLE `BusLayout` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `busId` INTEGER NOT NULL,
  `version` INTEGER NOT NULL,
  `layoutType` ENUM('SEATER_2_2', 'SEATER_2_1', 'SLEEPER_1_1') NOT NULL,
  `seatCapacity` INTEGER NOT NULL,
  `createdByUserId` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `BusLayout_busId_version_key`(`busId`, `version`),
  INDEX `BusLayout_busId_idx`(`busId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BusLayoutElement` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `layoutId` INTEGER NOT NULL,
  `type` ENUM('SEAT', 'DRIVER', 'EXIT_FRONT', 'EXIT_REAR', 'EXIT_FIRE', 'WASHROOM', 'ENGINE') NOT NULL,
  `deck` ENUM('LOWER', 'UPPER') NOT NULL DEFAULT 'LOWER',
  `row` INTEGER NOT NULL,
  `col` INTEGER NOT NULL,
  `label` VARCHAR(191) NULL,
  `seatNumber` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `BusLayoutElement_layoutId_deck_row_col_key`(`layoutId`, `deck`, `row`, `col`),
  UNIQUE INDEX `BusLayoutElement_layoutId_seatNumber_key`(`layoutId`, `seatNumber`),
  INDEX `BusLayoutElement_layoutId_type_idx`(`layoutId`, `type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Schedule` ADD COLUMN `busLayoutId` INTEGER NULL;

ALTER TABLE `Bus` ADD UNIQUE INDEX `Bus_currentLayoutId_key`(`currentLayoutId`);

ALTER TABLE `BusLayout` ADD CONSTRAINT `BusLayout_busId_fkey` FOREIGN KEY (`busId`) REFERENCES `Bus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `BusLayoutElement` ADD CONSTRAINT `BusLayoutElement_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `BusLayout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Bus` ADD CONSTRAINT `Bus_currentLayoutId_fkey` FOREIGN KEY (`currentLayoutId`) REFERENCES `BusLayout`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_busLayoutId_fkey` FOREIGN KEY (`busLayoutId`) REFERENCES `BusLayout`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
