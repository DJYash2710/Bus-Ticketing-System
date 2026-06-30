import type { BusDeck, BusLayoutType, LayoutElementType } from '@prisma/client';

export type LayoutElementInput = {
  type: LayoutElementType;
  deck?: BusDeck;
  row: number;
  col: number;
  label?: string | null;
  seatNumber?: string | null;
};

export type GeneratedLayout = {
  layoutType: BusLayoutType;
  seatsLeft: number;
  seatsRight: number;
  hasUpperDeck: boolean;
  lowerDeckCapacity: number | null;
  upperDeckCapacity: number | null;
  seatCapacity: number;
  elements: LayoutElementInput[];
};
