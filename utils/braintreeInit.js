const braintreeAuthHeader = () => {
    const token = Buffer.from(
        `${process.env.BRAINTREE_PUBLIC_KEY}:${process.env.BRAINTREE_PRIVATE_KEY}`
    ).toString('base64');
    return `Basic ${token}`;
};

const braintreeHeaders = () => ({
    'Braintree-Version': '2022-11-25',
    'Content-Type': 'application/json',
    Authorization: braintreeAuthHeader(),
});

module.exports = {
    braintreeHeaders,
};