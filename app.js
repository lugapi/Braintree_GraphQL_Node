require('dotenv').config();
const express = require('express');
const app = express();
const port = 3003;
const { ping } = require('./controllers/testController');
const { createPayPalOneTimePayment, chargePaymentMethod } = require('./controllers/paypalController');

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
    res.render('index', { title: 'Test Braintree GraphQL' });
});

app.get('/returning', (req, res) => {
    res.render('returning', { title: 'Returning flow' });
});


//////////////////////
// Controllers route
//////////////////////

// Route pour gérer le clic sur le bouton PayPal
app.post('/paypal-create-transaction', async (req, res) => {
    createPayPalOneTimePayment(req, res)
});

// Route pour gérer le clic sur le bouton PayPal
app.post('/paypal-returning', async (req, res) => {
    chargePaymentMethod(req, res)
});

app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
