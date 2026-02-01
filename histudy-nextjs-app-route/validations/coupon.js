export const isValidCouponFormat = (code) => {
    // Allows 8-character alphanumeric code (uppercase)
    const regex = /^[0-9A-Z]{8}$/;
    return regex.test(code);
};
