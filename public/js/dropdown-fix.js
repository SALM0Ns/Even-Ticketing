// Dropdown Fix Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dropdown fix script loaded');
    
    // Wait for Bootstrap to load
    setTimeout(function() {
        if (typeof bootstrap !== 'undefined') {
            console.log('Bootstrap loaded, initializing dropdowns');
            initializeDropdowns();
        } else {
            console.log('Bootstrap not loaded, retrying...');
            setTimeout(arguments.callee, 100);
        }
    }, 100);
});

function initializeDropdowns() {
    // Find all dropdown toggles
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    console.log('Found dropdown toggles:', dropdownToggles.length);
    
    dropdownToggles.forEach(function(toggle, index) {
        console.log(`Initializing dropdown ${index + 1}:`, toggle.id);
        
        try {
            // Create Bootstrap dropdown instance
            const dropdown = new bootstrap.Dropdown(toggle, {
                autoClose: true,
                boundary: 'viewport'
            });
            
            // Add event listeners
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Dropdown clicked:', this.id);
            });
            
            toggle.addEventListener('show.bs.dropdown', function() {
                console.log('Dropdown showing:', this.id);
            });
            
            toggle.addEventListener('shown.bs.dropdown', function() {
                console.log('Dropdown shown:', this.id);
            });
            
            console.log('Dropdown initialized successfully:', toggle.id);
            
        } catch (error) {
            console.error('Error initializing dropdown:', toggle.id, error);
        }
    });
    
    // Also try manual toggle for testing
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('User dropdown clicked');
            
            const dropdownMenu = this.nextElementSibling;
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('show');
                console.log('Toggled dropdown menu');
            }
        });
    }
}
