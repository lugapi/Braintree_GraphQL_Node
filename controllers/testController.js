const { braintreeHeaders } = require('../utils/braintreeInit');

const url = 'https://payments.sandbox.braintree-api.com/graphql';

const ping = async (req, res) => {
    const query = `
        query {
            ping
        }
    `;

    const options = {
        method: 'POST',
        headers: braintreeHeaders(),
        body: JSON.stringify({ query }),
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (data.errors) {
            return res.status(400).json({ errors: data.errors });
        }

        res.json({ message: 'Ping réussi', data: data.data });
    } catch (error) {
        res.status(500).json({
            error: 'Erreur lors de la communication avec Braintree',
            details: error.message,
        });
    }
};

module.exports = {
    ping,
};
