const toggleButton = document.getElementById('toggle-btn'); 
const sidebar = document.getElementById('sidebar'); 
const closeButton = document.getElementById('sidebar-close-btn'); // Add this if a close button exists

// Toggle sidebar open/close
function toggleSidebar() {
    sidebar.classList.toggle('close'); 
    toggleButton.classList.toggle('rotate'); 
    closeAllSubMenus();
}

// Close sidebar when clicking the close button (if exists)
if (closeButton) {
    closeButton.addEventListener('click', () => {
        sidebar.classList.add('close'); 
        toggleButton.classList.remove('rotate');
    });
}

// Toggle submenu
function toggleSubMenu(button) {
    if (!button.nextElementSibling.classList.contains('show')) {
        closeAllSubMenus();
    }

    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');

    if (sidebar.classList.contains('close')) {
        sidebar.classList.remove('close');
        toggleButton.classList.add('rotate');
    }
}

// Close all submenus
function closeAllSubMenus() {
    document.querySelectorAll('.show').forEach(ul => {
        ul.classList.remove('show');
        ul.previousElementSibling.classList.remove('rotate');
    });
}

// Update cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

document.addEventListener('click', (event) => {
    console.log('Clicked:', event.target);
});
