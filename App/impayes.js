document.getElementById('fetchEntreprise').onclick = async function() {
    const input = document.getElementById('token').value;
const isToken = /^\d+$/.test(input);  // Vérifie si l'input est numérique (token)

    const url = isToken
        ? `http://localhost:3000/entreprises/${input}` // Recherche par token
        : `http://localhost:3000/search-enterprises?name=${encodeURIComponent(input)}`; // Recherche par nom
    
    try {
        const response = await fetch(url);

        if (response.ok) {
        const entreprise = await response.json();

        // Gérer la réponse en fonction de la recherche par nom ou par token
            if (Array.isArray(entreprise) && entreprise.length > 0) {
                // Si la réponse est une liste (recherche par nom), on prend la première entreprise trouvée
                remplirInfosEntreprise(entreprise[0]);
            } else if (!Array.isArray(entreprise)) {
                // Sinon, recherche directe par token, la réponse est un seul objet entreprise
                remplirInfosEntreprise(entreprise);
            } else {
                alert('Aucune entreprise trouvée. Vérifiez le nom ou le token.');
            }
        } else {
            alert('Entreprise non trouvée. Vérifiez le nom ou le token.');
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'entreprise", error);
    alert("Une erreur est survenue lors de la récupération de l'entreprise.");
    }
};

function remplirInfosEntreprise(entreprise) {
    document.getElementById('entrepriseNom').innerText = entreprise.nom;
    document.getElementById('entrepriseAdresse').innerText = entreprise.adresse;
    document.getElementById('entrepriseTelephone').innerText = entreprise.telephone;
    document.getElementById('entrepriseEmail').innerText = entreprise.email;
    document.getElementById('entrepriseSiteWeb').href = entreprise.site_web;
    document.getElementById('entrepriseSiteWeb').innerText = entreprise.site_web;
    document.getElementById('entrepriseDescription').innerText = entreprise.description;

    document.getElementById('entrepriseInfo').classList.remove('hidden');
}

document.getElementById('createImpayéForm').onsubmit = async function(event) {
    event.preventDefault();

    const token = document.getElementById('token').value;
    const montant = document.getElementById('montant').value;
    const description = document.getElementById('description').value;

    try {
        const response = await fetch('http://localhost:3000/impaye', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, montant, description }),
        });

        if (response.ok) {
            alert('Impayé créé avec succès');
            document.getElementById('impayeForm').reset();
            document.getElementById('entrepriseInfo').classList.add('hidden');
        } else {
            const errorData = await response.json();
            alert(`Erreur lors de la création de l'impayé : ${errorData.error}`);
        }
    } catch (error) {
        console.error("Erreur lors de la création de l'impayé", error);
        alert("Une erreur est survenue lors de la création de l'impayé.");
    }
};
