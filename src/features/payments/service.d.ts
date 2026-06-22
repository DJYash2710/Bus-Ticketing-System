import type { AuditContext } from "../../core/audit/requestContext.js";
export declare function initiatePayment(bookingId: number, userId: number, audit?: AuditContext): Promise<{
    id: number;
    amount: import("@prisma/client/runtime/library").Decimal;
    status: import(".prisma/client").$Enums.PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
    bookingId: number;
    provider: string;
    providerRef: string | null;
    rawResponse: string | null;
    paidAt: Date | null;
    refundedAt: Date | null;
}>;
export declare function confirmPayment(paymentId: number, userId: number, audit?: AuditContext): Promise<{
    id: number;
    amount: import("@prisma/client/runtime/library").Decimal;
    status: import(".prisma/client").$Enums.PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
    bookingId: number;
    provider: string;
    providerRef: string | null;
    rawResponse: string | null;
    paidAt: Date | null;
    refundedAt: Date | null;
}>;
export declare function getPaymentByBookingId(bookingId: number, userId: number): Promise<{
    id: number;
    amount: import("@prisma/client/runtime/library").Decimal;
    status: import(".prisma/client").$Enums.PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
    bookingId: number;
    provider: string;
    providerRef: string | null;
    rawResponse: string | null;
    paidAt: Date | null;
    refundedAt: Date | null;
}>;
//# sourceMappingURL=service.d.ts.map