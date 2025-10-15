// Layout and Grid Management for Event Cards
document.addEventListener('DOMContentLoaded', function() {
    // Initialize layout after content is loaded
    setTimeout(initializeLayout, 100);
});

function initializeLayout() {
    // Add loading states
    addLoadingStates();
    
    // Initialize equal height cards
    equalizeCardHeights();
    
    // Add smooth animations
    addSmoothAnimations();
    
    // Initialize lazy loading for images
    initializeLazyLoading();
    
    // Initialize scroll buttons
    setTimeout(() => {
        if (window.EventTicketing && window.EventTicketing.updateScrollButtons) {
            window.EventTicketing.updateScrollButtons();
        }
    }, 500);
}

function addLoadingStates() {
    const containers = [
        'movies-container',
        'stage-plays-container', 
        'orchestra-container'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">Loading events...</p>
                </div>
            `;
        }
    });
}

function equalizeCardHeights() {
    // Equalize heights within each section
    const sections = ['movies', 'stage-plays', 'orchestra'];
    
    sections.forEach(section => {
        const container = document.getElementById(`${section}-container`);
        if (container) {
            const cards = container.querySelectorAll('.event-card');
            if (cards.length > 0) {
                // Reset heights
                cards.forEach(card => {
                    card.style.height = 'auto';
                });
                
                // Find max height
                let maxHeight = 0;
                cards.forEach(card => {
                    const height = card.offsetHeight;
                    if (height > maxHeight) {
                        maxHeight = height;
                    }
                });
                
                // Apply max height
                cards.forEach(card => {
                    card.style.height = maxHeight + 'px';
                });
            }
        }
    });
}

function addSmoothAnimations() {
    // Add staggered animation to event cards
    const cards = document.querySelectorAll('.event-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function initializeLazyLoading() {
    // Simple lazy loading for images
    const images = document.querySelectorAll('.event-card img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Utility function to refresh layout
function refreshLayout() {
    equalizeCardHeights();
    addSmoothAnimations();
}

// Export for global use
window.LayoutManager = {
    refreshLayout: refreshLayout,
    equalizeCardHeights: equalizeCardHeights,
    addSmoothAnimations: addSmoothAnimations
};
