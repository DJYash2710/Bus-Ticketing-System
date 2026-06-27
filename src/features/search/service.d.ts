type SearchSchedulesInput = {
    fromCityId: number;
    toCityId: number;
    date: string;
};
export declare function searchSchedules(input: SearchSchedulesInput): Promise<{
    search: {
        fromCity: {
            name: string;
            id: number;
            state: string | null;
            country: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        toCity: {
            name: string;
            id: number;
            state: string | null;
            country: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        date: string;
    };
    count: number;
    schedules: {
        scheduleId: number;
        departureTime: Date;
        arrivalTime: Date | null;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        route: {
            id: number;
            code: string;
            distanceKm: number | null;
            durationMin: number | null;
            fromCity: {
                name: string;
                id: number;
                state: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            toCity: {
                name: string;
                id: number;
                state: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
        bus: {
            id: number;
            name: string;
            registrationNo: string;
            type: import(".prisma/client").$Enums.BusType;
            capacity: number;
            amenities: string | null;
        };
        seatSummary: {
            totalSeats: number;
            availableSeats: number;
            heldSeats: number;
            bookedSeats: number;
        };
    }[];
}>;
export {};
//# sourceMappingURL=service.d.ts.map