-- Phase 5a: per-deck capacity + roof exit cap element
ALTER TABLE `BusLayout`
  ADD COLUMN `lowerDeckCapacity` INTEGER NULL,
  ADD COLUMN `upperDeckCapacity` INTEGER NULL;

ALTER TABLE `BusLayoutElement`
  MODIFY `type` ENUM(
    'SEAT',
    'DRIVER',
    'EXIT_FRONT',
    'EXIT_REAR',
    'EXIT_FIRE',
    'WASHROOM',
    'ENGINE',
    'ROOF_EXIT'
  ) NOT NULL;
