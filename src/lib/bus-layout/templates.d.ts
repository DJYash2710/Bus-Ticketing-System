import { BusLayoutType } from '@prisma/client';
import { capRowForType, defaultLabelForCap, type CapElementType } from './geometry.js';
import type { GeneratedLayout, LayoutElementInput } from './types.js';
export type CapPlacement = Partial<Record<CapElementType, {
    row: number;
    col: number;
}>>;
export type LayoutBuildConfig = {
    seatsLeft: number;
    seatsRight: number;
    seatCapacity: number;
    bodyType: 'SEATER' | 'SLEEPER' | 'SEMI_SLEEPER';
    hasUpperDeck?: boolean;
    lowerDeckCapacity?: number;
    upperDeckCapacity?: number;
    caps?: CapPlacement;
    aisleCaps?: LayoutElementInput[];
    includeWashroom?: boolean;
};
export declare function extractCapPlacement(elements: LayoutElementInput[]): CapPlacement;
export declare function extractAisleCapElements(elements: LayoutElementInput[]): LayoutElementInput[];
export declare function extractCapElements(elements: LayoutElementInput[]): LayoutElementInput[];
export declare function extractPreservedCapElements(elements: LayoutElementInput[]): LayoutElementInput[];
export declare function buildLayout(config: LayoutBuildConfig): GeneratedLayout;
export declare function regenerateLayoutElements(capElements: LayoutElementInput[], config: Omit<LayoutBuildConfig, 'caps' | 'aisleCaps'>): LayoutElementInput[];
export declare function defaultLayoutTypeForBody(bodyType: 'SEATER' | 'SLEEPER' | 'SEMI_SLEEPER'): BusLayoutType;
export declare function layoutConfigFromTemplate(layoutType: BusLayoutType, seatCapacity: number, bodyType?: 'SEATER' | 'SLEEPER' | 'SEMI_SLEEPER'): LayoutBuildConfig;
export declare function generateLayoutFromTemplate(layoutType: BusLayoutType, seatCapacity: number, bodyType?: 'SEATER' | 'SLEEPER' | 'SEMI_SLEEPER'): GeneratedLayout;
export { capRowForType, defaultLabelForCap };
//# sourceMappingURL=templates.d.ts.map