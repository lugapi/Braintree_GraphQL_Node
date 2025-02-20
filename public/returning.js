let json = {
    variables: {
        lucasInput: {
            paymentMethodId: "cGF5bWVudG1ldGhvZF9wcF9yZWJxYWN4aw",
            transaction: {
                amount: "22.22"
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

async function returning() {
    const trxResult = document.querySelector('.result.trx');
    jsonToSend = editor.get();
    const response = await fetch('/paypal-charge-pm', {
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
    document.querySelector('.result.trx pre').innerHTML = JSON.stringify(result, null, 2);

    if (result.error) {
        // alert('Erreur : ' + result.error);
        // redirect customer on custom page
        trxResult.classList.add('bg-red-100')
    }else {
        // alert('Transaction réussie !');
        trxResult.classList.add('bg-green-100')
    }

    trxResult.classList.remove('hidden')
    trxResult.scrollIntoView();
}


async function findCustomerPM() {

    const custId = document.querySelector('#custId').value;

    const response = await fetch('/paypal-find-customerPM', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            custId
        }),
    });

    const result = await response.json();
    document.querySelector('#vaultListSection').classList.remove('hidden')
    document.querySelector('#fullResponseSection').classList.remove('hidden')

    if(result.error){
        document.querySelector('.result.customer').classList.add('bg-red-100')
    }else{
        document.querySelector('.result.customer').classList.add('bg-green-100')
    }
    document.querySelector('.result.customer').classList.remove('hidden')
    document.querySelector('.result.customer pre').innerHTML = JSON.stringify(result, null, 2);

    // Sélectionnez le conteneur des cartes
    const cardsContainer = document.getElementById('cards-container');

    // Parcourez les méthodes de paiement et créez des cartes
    result.data.node.paymentMethods.edges.forEach(edge => {
        const vaultId = edge.node.id;
        const { email, billingAgreementId } = edge.node.details;

        // Créez une carte pour chaque méthode de paiement
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-100';

        // Ajoutez le contenu de la carte
        card.innerHTML = `
            <h2 class="text-xl font-semibold mb-2">Email: ${email}</h2>
            <p class="text-gray-600">Vault ID: ${vaultId}</p>
            <p class="text-gray-600">Token: ${billingAgreementId}</p>
        `;

        // Ajoutez un événement onclick pour afficher une alerte avec le vaultId
        card.onclick = function () {
            document.getElementById("emailOnButton").innerText = edge.node.details.email;
            document.querySelector(".ppBtn").classList.remove('hidden');
            // alert(`Vault ID: ${vaultId}`);
            let varToSend = editor.get()
            varToSend.variables.lucasInput.paymentMethodId = vaultId
            editor.set(varToSend)
            editor.expandAll();
            document.getElementById("createTrxSection").classList.remove('hidden');
            document.getElementById("ppBtn").scrollIntoView();
        };

        // Ajoutez la carte au conteneur
        cardsContainer.appendChild(card);
    });


    if (result.error) {
        alert('Erreur : ' + result.error);
        // redirect customer on custom page
    }
    // else {
    //     alert('Mutation GraphQL réussie !');
    // }
}



const jsonOneShot = {
    variables: {
        lucasInput: {
            amount: { value: "100.01", currencyCode: "EUR" },
            intent: "SALE",
            returnUrl: "https://integration.lugapi.fr/display-params",
            cancelUrl: "https://paypal.com/cancel",
            offerPayLater: true,
            requestBillingAgreement: false,
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

async function oneShot() {
    jsonToSend = jsonOneShot;
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
    document.querySelector('.result.trx pre').innerHTML = JSON.stringify(result, null, 2);
    document.querySelector('.result.trx').classList.remove('hidden')
    document.querySelector('#oneTimeTokenize').classList.remove('hidden')
    
    if (result.error) {
        alert('Erreur : ' + result.error);
        // redirect customer on custom page
    } else {
        window.open(result.data.approvalUrl, '_blank');
    }
}


async function tokenizeOneTime() {

    const paymentId = document.querySelector('#paymentId').value;
    const payerId = document.querySelector('#payerId').value;

    const response = await fetch('/paypal-tokenize-onetime', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Ajoutez les données nécessaires à la mutation ici
            paymentId,payerId
        }),
    });

    const result = await response.json();
    console.log(result);
    document.querySelector('.result.tokenize pre').innerHTML = JSON.stringify(result, null, 2);
    document.querySelector('#chargePaymentMethod input').value = result.data.paymentMethod.id
    document.querySelector('#chargePaymentMethod').classList.remove('hidden')

    if (result.error) {
        alert('Erreur : ' + result.error);
        // redirect customer on custom page
    }
    // else {
    //     alert('Mutation GraphQL réussie !');
    // }
}

async function chargePM() {
   
    const paymentMethod = document.querySelector('#chargePaymentMethod input').value;
    json.variables.lucasInput.paymentMethodId = paymentMethod
    jsonToSend = json
    console.log(json)

    const response = await fetch('/paypal-charge-pm', {
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
    document.querySelector('#chargePaymentMethod .result pre').innerHTML = JSON.stringify(result, null, 2);

    if (result.error) {
        alert('Erreur : ' + result.error);
    }
}
