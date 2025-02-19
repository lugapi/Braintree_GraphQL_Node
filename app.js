require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3333;
const path = require('path');
const { ping } = require('./controllers/testController');
const { createPayPalOneTimePayment, chargePaymentMethod, tokenizePayPalBillingAgreement, vaultPaymentMethod, findCustomerPM } = require('./controllers/paypalController');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Définir EJS comme moteur de templates
app.set('view engine', 'ejs');

// Middleware pour analyser les requêtes JSON
app.use(express.json());

app.get('/ping', ping);

//////////
// Router 
//////////

// Render page
app.get('/', (req, res) => {
    res.render('index', { title: 'Braintree GraphQL', doc: 'https://developer.paypal.com/braintree/graphql/reference' });
});

app.get('/returning', (req, res) => {
    const custId = req.query?.custId
    res.render('returning', { title: 'Returning flow', custId: custId });
});


//////////////////////
// Controllers route
//////////////////////

// Route pour gérer le clic sur le bouton PayPal
app.post('/paypal-create-transaction', async (req, res) => {
    createPayPalOneTimePayment(req, res)
});

app.post('/paypal-tokenize-ba', async (req, res) => {
    tokenizePayPalBillingAgreement(req, res)
});

app.post('/paypal-vault-pm', async (req, res) => {
    vaultPaymentMethod(req, res)
});

// Route pour gérer le clic sur le bouton PayPal
app.post('/paypal-returning', async (req, res) => {
    chargePaymentMethod(req, res)
});

app.post('/paypal-find-customerPM', async (req, res) => {
    findCustomerPM(req, res)
});


app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
