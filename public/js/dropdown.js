// Dropdown functionality for CursedTicket
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing dropdowns...');
    
    // Initialize all dropdowns
    const dropdownElements = document.querySelectorAll('.dropdown-toggle');
    console.log('Found dropdown elements:', dropdownElements.length);
    
    dropdownElements.forEach(function(dropdownToggle) {
        console.log('Initializing dropdown:', dropdownToggle.id);
        
        // Create Bootstrap dropdown instance
        const dropdown = new bootstrap.Dropdown(dropdownToggle, {
            autoClose: true,
            boundary: 'viewport'
        });
        
        // Add click event listener
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Dropdown clicked:', this.id);
        });
        
        // Add show event listener
        dropdownToggle.addEventListener('show.bs.dropdown', function() {
            console.log('Dropdown showing:', this.id);
        });
        
        // Add shown event listener
        dropdownToggle.addEventListener('shown.bs.dropdown', function() {
            console.log('Dropdown shown:', this.id);
        });
    });
    
    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach(function(tooltipEl) {
        new bootstrap.Tooltip(tooltipEl);
    });
    
    // Initialize popovers
    const popoverElements = document.querySelectorAll('[data-bs-toggle="popover"]');
    popoverElements.forEach(function(popoverEl) {
        new bootstrap.Popover(popoverEl);
    });
    
    console.log('All dropdowns initialized successfully');
});
