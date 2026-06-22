-- AlterTable
ALTER TABLE `User` ADD COLUMN `busOperatorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_busOperatorId_fkey` FOREIGN KEY (`busOperatorId`) REFERENCES `BusOperator`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
