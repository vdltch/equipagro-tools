document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const message = document.getElementById('message');

    // Vérifier la session utilisateur au chargement de la page
    const token = localStorage.getItem('token');
    if (token) {
        fetch('http://localhost:3000/user-session', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log('Réponse du serveur:', response); // Affiche la réponse
            if (response.status === 200) {
                message.innerText = "Vous êtes déjà connecté.";
                loginForm.style.display = 'none';
                logoutBtn.style.display = 'block';
            } else {
                throw new Error("Non connecté");
            }
        })
        .catch(() => {
            loginForm.style.display = 'block';
            logoutBtn.style.display = 'none';
        });
    } else {
        loginForm.style.display = 'block';
        logoutBtn.style.display = 'none';
    }

    // Gestion de la connexion
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                const successPopup = document.getElementById('successPopup');
                successPopup.classList.remove('hidden');
    
                // Redirection après un court délai
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirection vers la page principale
                }, 2000); // 2 secondes de délai
            } else {
                message.innerText = 'Erreur : ' + (data.message || 'Connexion échouée');
            }
        })
        .catch(error => {
            message.innerText = 'Erreur : ' + error.message;
        });
    });

    // Gestion de la déconnexion
    logoutBtn.addEventListener('click', () => {
        fetch('http://localhost:3000/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (response.status === 200) {
                // Supprimer le token de localStorage
                localStorage.removeItem('token');
                message.innerText = 'Déconnexion réussie.';
                loginForm.style.display = 'block';
                logoutBtn.style.display = 'none';
            } else {
                message.innerText = 'Erreur lors de la déconnexion';
            }
        })
        .catch(error => {
            message.innerText = 'Erreur : ' + error.message;
        });
    });
});