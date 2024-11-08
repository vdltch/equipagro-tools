document.getElementById('impayeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const client_name = document.getElementById('client_name').value;
    const montant = document.getElementById('montant').value;
    const date_creation = document.getElementById('date_creation').value;
    const date_echeance = document.getElementById('date_echeance').value;
    const statut = document.getElementById('statut').value;

    const response = await fetch('http://localhost:3000/impayes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_name,
            montant,
            date_creation,
            date_echeance,
            statut,
        }),
    });

    if (response.ok) {
        alert('Impayé ajouté avec succès');
        fetchImpayes(); // Rafraîchir la liste
    } else {
        alert('Erreur lors de l\'ajout de l\'impayé');
    }
});

async function fetchImpayes() {
    const response = await fetch('http://localhost:3000/impayes');
    const impayes = await response.json();
    const impayesList = document.getElementById('impayesList');
    impayesList.innerHTML = ''; // Réinitialiser la liste

    impayes.forEach(impaye => {
        const impayeDiv = document.createElement('div');
        impayeDiv.className = 'bg-white p-4 rounded-lg shadow hover:shadow-lg transition duration-200';
        impayeDiv.innerHTML = `
            <p><strong>Client:</strong> ${impaye.client_name}</p>
            <p><strong>Montant:</strong> ${impaye.montant} €</p>
            <p><strong>Statut:</strong> ${impaye.statut}</p>
            <p><strong>Date de création:</strong> ${impaye.date_creation}</p>
            <p><strong>Date d'échéance:</strong> ${impaye.date_echeance}</p>
        `;
        impayesList.appendChild(impayeDiv);
    });
}

// Charger les impayés au démarrage
fetchImpayes();

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Si l'utilisateur est authentifié, continuez
    }
    res.redirect('/login'); // Sinon, redirigez vers la page de connexion
}
