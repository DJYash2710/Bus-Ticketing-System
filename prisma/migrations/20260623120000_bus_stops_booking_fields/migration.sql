-- BusStop table
CREATE TABLE `BusStop` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `locality` VARCHAR(191) NOT NULL,
    `cityId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusStop_cityId_idx`(`cityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Route stop references
ALTER TABLE `Route` ADD COLUMN `startBusStopId` INTEGER NULL,
    ADD COLUMN `endBusStopId` INTEGER NULL;

-- Booking boarding/dropping points
ALTER TABLE `Booking` ADD COLUMN `boardingPoint` VARCHAR(191) NULL,
    ADD COLUMN `droppingPoint` VARCHAR(191) NULL;

ALTER TABLE `BusStop` ADD CONSTRAINT `BusStop_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Route` ADD CONSTRAINT `Route_startBusStopId_fkey` FOREIGN KEY (`startBusStopId`) REFERENCES `BusStop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Route` ADD CONSTRAINT `Route_endBusStopId_fkey` FOREIGN KEY (`endBusStopId`) REFERENCES `BusStop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
