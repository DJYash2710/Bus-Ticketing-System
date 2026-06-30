-- Phase 4: optional upper deck on bus layouts
ALTER TABLE `BusLayout` ADD COLUMN `hasUpperDeck` BOOLEAN NOT NULL DEFAULT false;
