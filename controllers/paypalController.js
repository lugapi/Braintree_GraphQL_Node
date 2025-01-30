const { braintreeHeaders } = require('../utils/braintreeInit');

const url = 'https://payments.sandbox.braintree-api.com/graphql';

const createPayPalOneTimePayment = async (req, res) => {

    // Création du payload pour la mutation GraphQL
    const requestPayload = JSON.stringify({
        query: `
            mutation createPayPalOneTimePayment($lucasInput: CreatePayPalOneTimePaymentInput!) {
                createPayPalOneTimePayment(input: $lucasInput) {
                    paymentId
                    approvalUrl
                }
            }
        `,

        variables: req.body.jsonToSend.variables
    });

    // Configuration de la requête fetch
    const options = {
        method: 'POST',
        headers: braintreeHeaders(),
        body: requestPayload
    };

    try {
        // Envoi de la requête GraphQL
        const response = await fetch(url, options);
        const responsePayload = await response.json();

        // Vérification des erreurs renvoyées par l'API
        if (responsePayload.errors) {
            return res.status(400).json({
                error: responsePayload.errors[0]?.message || 'Erreur inconnue dans la réponse de Braintree'
            });
        }

        // Renvoi de la réponse au client
        res.json({
            success: true,
            data: responsePayload.data.createPayPalOneTimePayment
        });
    } catch (error) {
        // Gestion des erreurs réseau ou autres exceptions
        res.status(500).json({
            error: 'Erreur lors de la mutation GraphQL',
            details: error.message
        });
    }
};

const chargePaymentMethod = async (req, res) => {

    // Création du payload pour la mutation GraphQL
    const requestPayload = JSON.stringify({
        query: `
            mutation chargePaymentMethod($lucasInput: ChargePaymentMethodInput!) {
                chargePaymentMethod(input: $lucasInput) {
                    transaction {
                    id
                    legacyId
                    status
                    amount{
                        value
                    },
                    customer{
                        id,
                        legacyId
                    },
                    paymentMethod{
                        legacyId,
                        details{
                            ... on PayPalAccountDetails{
                                payerId,
                                email
                            }
                        }
                    }
                    }
                }
            }
        `,
        variables: req.body.jsonToSend.variables
    });

    // Configuration de la requête fetch
    const options = {
        method: 'POST',
        headers: braintreeHeaders(),
        body: requestPayload
    };

    try {
        // Envoi de la requête GraphQL
        const response = await fetch(url, options);
        const responsePayload = await response.json();

        // Vérification des erreurs renvoyées par l'API
        if (responsePayload.errors) {
            return res.status(400).json({
                error: responsePayload.errors[0]?.message || 'Erreur inconnue dans la réponse de Braintree'
            });
        }

        // Renvoi de la réponse au client
        res.json({
            success: true,
            data: responsePayload.data
        });
    } catch (error) {
        // Gestion des erreurs réseau ou autres exceptions
        res.status(500).json({
            error: 'Erreur lors de la mutation GraphQL',
            details: error.message
        });
    }
};

module.exports = {
    createPayPalOneTimePayment, chargePaymentMethod
};
