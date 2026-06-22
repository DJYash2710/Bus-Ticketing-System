-- AlterTable
ALTER TABLE `Booking` MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

ALTER TABLE `Booking` ADD COLUMN `holdExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `expiredAt` DATETIME(3) NULL;

CREATE INDEX `Booking_status_holdExpiresAt_idx` ON `Booking`(`status`, `holdExpiresAt`);

ALTER TABLE `Seat` ADD COLUMN `heldUntil` DATETIME(3) NULL;

CREATE INDEX `Seat_status_heldUntil_idx` ON `Seat`(`status`, `heldUntil`);
