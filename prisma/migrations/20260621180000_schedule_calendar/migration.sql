-- AlterTable Route: estimated duration for calendar auto-fill
ALTER TABLE `Route` ADD COLUMN `estimatedDurationMinutes` INTEGER NULL;

-- AlterTable Schedule: calendar color + recurrence metadata
ALTER TABLE `Schedule` ADD COLUMN `color` VARCHAR(191) NULL DEFAULT '#4F46E5',
    ADD COLUMN `recurrenceGroupId` VARCHAR(191) NULL,
    ADD COLUMN `isRecurrenceException` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Schedule_recurrenceGroupId_idx` ON `Schedule`(`recurrenceGroupId`);
