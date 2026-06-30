export function isStripeInitiateResult(result) {
    return (typeof result === 'object' &&
        result !== null &&
        'paymentIntentId' in result &&
        'clientSecret' in result);
}
//# sourceMappingURL=initiatePayment.types.js.map