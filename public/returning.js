const json = {
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

async function callGraphQL() {
    const trxResult = document.querySelector('.result.trx');
    jsonToSend = editor.get();
    const response = await fetch('/paypal-returning', {
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