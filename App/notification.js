const notificationButton = document.getElementById('notificationButton');
    const notificationPopup = document.getElementById('notificationPopup');

    // Toggle popup visibility when the bell icon is clicked
    notificationButton.onclick = () => {
        notificationPopup.classList.toggle('hidden');
    };

    // Close popup when clicking outside of it
    window.onclick = (event) => {
        if (!notificationButton.contains(event.target) && !notificationPopup.contains(event.target)) {
            notificationPopup.classList.add('hidden');
        }
    };