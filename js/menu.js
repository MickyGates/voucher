function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    menu.classList.toggle('show');
}

// Close menu when clicking outside
window.addEventListener('click', function(e) {
    const menu = document.getElementById('dropdownMenu');
    const menuIcon = document.querySelector('.menu-icon');
    if (!menuIcon.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('show');
    }
});