// Main JavaScript file for Event Ticketing System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Initialize countdown timers
    initializeCountdownTimers();

    // Load featured events on homepage
    if (window.location.pathname === '/') {
        loadFeaturedEvents();
        loadStatistics();
    }
});

// Countdown Timer Functionality
function initializeCountdownTimers() {
    const countdownElements = document.querySelectorAll('.countdown-timer');
    
    countdownElements.forEach(function(element) {
        const eventDate = element.getAttribute('data-event-date');
        if (eventDate) {
            startCountdown(element, eventDate);
        }
    });
}

function startCountdown(element, eventDate) {
    const eventDateTime = new Date(eventDate).getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDateTime - now;
        
        if (distance < 0) {
            element.innerHTML = '<h4>Event has started!</h4>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        element.innerHTML = `
            <div class="countdown-item">
                <span class="countdown-number">${days}</span>
                <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${hours}</span>
                <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${minutes}</span>
                <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${seconds}</span>
                <span class="countdown-label">Seconds</span>
            </div>
        `;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Load Featured Events
function loadFeaturedEvents() {
    fetch('/api/events/featured')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('featured-events');
            if (data.events && data.events.length > 0) {
                container.innerHTML = data.events.map(event => createEventCard(event)).join('');
            } else {
                container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No featured events available at the moment.</p></div>';
            }
        })
        .catch(error => {
            console.error('Error loading featured events:', error);
            const container = document.getElementById('featured-events');
            container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error loading events. Please try again later.</p></div>';
        });
}

// Create Event Card HTML
function createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const categoryIcons = {
        'movies': 'fas fa-film',
        'stage-plays': 'fas fa-theater-masks',
        'orchestra': 'fas fa-music'
    };
    
    const categoryColors = {
        'movies': 'primary',
        'stage-plays': 'success',
        'orchestra': 'warning'
    };
    
    const categoryDisplayNames = {
        'movies': 'Movies',
        'stage-plays': 'Stage Plays',
        'orchestra': 'Live Orchestra'
    };
    
    const icon = categoryIcons[event.category] || 'fas fa-calendar';
    const color = categoryColors[event.category] || 'secondary';
    const categoryName = categoryDisplayNames[event.category] || event.category;
    
    return `
        <div class="col-md-4 mb-4">
            <div class="card event-card h-100 category-${event.category}">
                <img src="${event.image || '/images/default-event.jpg'}" class="card-img-top" alt="${event.name}">
                <div class="category-badge ${event.category}">
                    <i class="${icon} me-1"></i>${categoryName}
                </div>
                <div class="event-status status-upcoming">Upcoming</div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${event.name}</h5>
                    <p class="card-text flex-grow-1">${event.description.substring(0, 100)}...</p>
                    <div class="mt-auto">
                        <p class="text-muted mb-2">
                            <i class="fas fa-calendar-alt me-1"></i>${formattedDate}
                        </p>
                        <p class="text-muted mb-3">
                            <i class="fas fa-map-marker-alt me-1"></i>${event.location.name}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 text-${color} mb-0">$${event.pricing.basePrice}</span>
                            <a href="/events/${event._id}" class="btn btn-${color}">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load Statistics
function loadStatistics() {
    fetch('/api/statistics')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-events').textContent = data.totalEvents || 0;
            document.getElementById('total-tickets').textContent = data.totalTickets || 0;
            document.getElementById('total-users').textContent = data.totalUsers || 0;
            document.getElementById('total-organizers').textContent = data.totalOrganizers || 0;
        })
        .catch(error => {
            console.error('Error loading statistics:', error);
        });
}

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Image Preview
function previewImage(input, previewId) {
    const file = input.files[0];
    const preview = document.getElementById(previewId);
    
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// QR Code Generation (for tickets)
function generateQRCode(text, containerId) {
    if (typeof QRCode !== 'undefined') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            new QRCode(container, {
                text: text,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Search and Filter Functions
function searchEvents(query) {
    const eventCards = document.querySelectorAll('.event-card');
    const searchTerm = query.toLowerCase();
    
    eventCards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const description = card.querySelector('.card-text').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.closest('.col-md-4').style.display = 'block';
        } else {
            card.closest('.col-md-4').style.display = 'none';
        }
    });
}

// Export functions for global use
window.EventTicketing = {
    startCountdown: startCountdown,
    generateQRCode: generateQRCode,
    formatDate: formatDate,
    formatCurrency: formatCurrency,
    searchEvents: searchEvents,
    validateForm: validateForm,
    previewImage: previewImage
};
