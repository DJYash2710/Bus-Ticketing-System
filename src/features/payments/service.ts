import { PaymentStatus, BookingStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";

export async function initiatePayment(bookingId: number, userId: number) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.paymentStatus === PaymentStatus.SUCCESS) {
    throw new ApiError(400, "Booking is already paid");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(400, "Cannot pay for a cancelled booking");
  }

  const existing = await prisma.payment.findUnique({ where: { bookingId } });
  if (existing) {
    return existing;
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      provider: "MOCK",
      amount: booking.totalAmount,
      status: PaymentStatus.PENDING,
    },
  });

  return payment;
}

export async function confirmPayment(paymentId: number, userId: number) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) throw new ApiError(404, "Payment not found");
  if (payment.booking.userId !== userId) throw new ApiError(403, "Forbidden");

  if (payment.status === PaymentStatus.SUCCESS) {
    throw new ApiError(400, "Payment already confirmed");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        providerRef: `MOCK-TXN-${Date.now()}`,
        paidAt: new Date(),
        rawResponse: JSON.stringify({ note: "Mock payment confirmed" }),
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: PaymentStatus.SUCCESS },
    });

    return updatedPayment;
  });

  return result;
}

export async function getPaymentByBookingId(bookingId: number, userId: number) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment) throw new ApiError(404, "No payment found for this booking");

  return payment;
}