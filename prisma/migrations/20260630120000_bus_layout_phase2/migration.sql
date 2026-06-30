-- Phase 2: configurable aisle geometry per layout version

ALTER TABLE `BusLayout`
  ADD COLUMN `seatsLeft` INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN `seatsRight` INTEGER NOT NULL DEFAULT 2;

UPDATE `BusLayout` SET `seatsLeft` = 2, `seatsRight` = 1 WHERE `layoutType` = 'SEATER_2_1';
UPDATE `BusLayout` SET `seatsLeft` = 1, `seatsRight` = 1 WHERE `layoutType` = 'SLEEPER_1_1';
