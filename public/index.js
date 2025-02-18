
const json = {
    variables: {
        lucasInput: {
            amount: { value: "100.01", currencyCode: "EUR" },
            intent: "SALE",
            returnUrl: "https://integration.lugapi.fr/display-params",
            cancelUrl: "https://paypal.com/cancel",
            offerPayLater: false,
            requestBillingAgreement: true,
            shippingAddress: {
                addressLine1: "700 Cuesta Dr",
                adminArea1: "CA",
                adminArea2: "Mountain View",
                postalCode: "94040",
                countryCode: "US"
            }
        }
    }
}

const container = document.getElementById("jsoneditor");
const options = {
    modes: ["text", "code", "tree", "form", "view"],
    mode: "tree",
    search: true,
    onChangeJSON: function (json) {
        console.log('JSON has changed, PP buttons reset!')
    }
};
const editor = new JSONEditor(container, options);
editor.set(json)
editor.expandAll();

async function callGraphQL() {
    jsonToSend = editor.get();
    const response = await fetch('/paypal-create-transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Ajoutez les données nécessaires à la mutation ici
            jsonToSend
        }),
    });

    const result = await response.json();
    console.log(result);
    document.querySelector('.result.create pre').innerHTML = JSON.stringify(result, null, 2);
    document.querySelector('#resultsAndActions').classList.remove('hidden')

    if (result.error) {
        alert('Erreur : ' + result.error);
        // redirect customer on custom page
    } else {
        window.open(result.data.approvalUrl, '_blank');
    }
}

async function tokenizeBA() {

    const BaToVault = document.querySelector('.BaToVault input').value;

    const response = await fetch('/paypal-tokenize-ba', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Ajoutez les données nécessaires à la mutation ici
            BaToVault
        }),
    });

    const result = await response.json();
    console.log(result);
    document.querySelector('.result.tokenize pre').innerHTML = JSON.stringify(result, null, 2);
    document.querySelector('.paymentMethodId input').value = result.data.paymentMethod.id

    if (result.error) {
        alert('Erreur : ' + result.error);
        // redirect customer on custom page
    }
    // else {
    //     alert('Mutation GraphQL réussie !');
    // }
}

async function vaultPM() {

    const paymentMethodId = document.querySelector('.paymentMethodId input').value;

    const response = await fetch('/paypal-vault-pm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paymentMethodId
        }),
    });

    const result = await response.json();
    console.log(result);
    document.querySelector('.result.vault pre').innerHTML = JSON.stringify(result, null, 2);
    document.getElementById("returningLink").innerText += ` with customer ${result.data.vaultPaymentMethod.paymentMethod.customer.id}`
    document.getElementById("returningLink").href += `?custId=${result.data.vaultPaymentMethod.paymentMethod.customer.id}`

    if (result.error) {
        alert('Erreur : ' + result.error);
        // redirect customer on custom page
    }
    // else {
    //     alert('Mutation GraphQL réussie !');
    // }
}