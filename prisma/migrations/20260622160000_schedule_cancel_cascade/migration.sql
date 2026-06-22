-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `cancellationReason` VARCHAR(191) NULL;

-- AlterEnum (MySQL: extend PaymentStatus via column modification)
ALTER TABLE `Payment` MODIFY `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'REFUND_PENDING', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
