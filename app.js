const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();

// Définir EJS comme moteur de templates
app.set('view engine', 'ejs');

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Route principale
app.get('/', (req, res) => {
    res.render('index', { title: 'Test Braintree GraphQL' });
});

/////////////////////////
// GRAPHQL CONFIG START
/////////////////////////

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

const url = 'https://payments.sandbox.braintree-api.com/graphql';

/////////////////////////
// GRAPHQL CONFIG END
/////////////////////////


app.get('/ping', async (req, res) => {

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
        res.status(500).json({ error: 'Erreur lors de la communication avec Braintree', details: error.message });
    }
});
// Route pour gérer le clic sur le bouton PayPal
app.post('/paypal-create-transaction', async (req, res) => {
    const url = 'https://payments.sandbox.braintree-api.com/graphql';

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
        variables: {
            lucasInput: {
                amount: { value: "100.01", currencyCode: "EUR" },
                intent: "SALE",
                returnUrl: "https://paypal.com/success",
                cancelUrl: "https://paypal.com/cancel",
                offerPayLater: false,
                shippingAddress: {
                    addressLine1: "700 Cuesta Dr",
                    adminArea1: "CA",
                    adminArea2: "Mountain View",
                    postalCode: "94040",
                    countryCode: "US"
                }
            }
        }
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
});

app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
