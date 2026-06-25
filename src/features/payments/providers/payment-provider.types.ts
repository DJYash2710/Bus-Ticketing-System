export const PAYMENT_PROVIDERS = {
  MOCK: 'MOCK',
  STRIPE: 'STRIPE',
} as const;

export type PaymentProviderName =
  (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

export type ProviderPaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type CreateProviderPaymentInput = {
  bookingId: number;
  paymentId: number;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
};

export type CreateProviderPaymentResult = {
  providerRef: string;
  clientSecret: string | null;
  rawResponse: string;
};

export type RetrieveProviderPaymentResult = {
  providerRef: string;
  status: ProviderPaymentStatus;
  rawResponse: string;
};

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createPayment(
    input: CreateProviderPaymentInput,
  ): Promise<CreateProviderPaymentResult>;
  retrievePayment(providerRef: string): Promise<RetrieveProviderPaymentResult>;
}
