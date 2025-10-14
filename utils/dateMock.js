// Date Mocking Utility for CursedTicket
// This prevents system date filtering issues by providing consistent mock dates

class DateMock {
    constructor() {
        // Set a fixed "current" date for consistent behavior
        this.mockCurrentDate = new Date('2024-12-19T10:00:00Z'); // December 19, 2024
        this.mockTimeZone = 'America/New_York';
    }

    // Get the mocked current date
    getCurrentDate() {
        return new Date(this.mockCurrentDate);
    }

    // Get a date that's X days from the mock current date
    getDateFromNow(days) {
        const date = new Date(this.mockCurrentDate);
        date.setDate(date.getDate() + days);
        return date;
    }

    // Get a date that's X hours from the mock current date
    getTimeFromNow(hours) {
        const date = new Date(this.mockCurrentDate);
        date.setHours(date.getHours() + hours);
        return date;
    }

    // Check if a date is in the future relative to mock current date
    isFuture(date) {
        return new Date(date) > this.mockCurrentDate;
    }

    // Check if a date is within X days from mock current date
    isWithinDays(date, days) {
        const targetDate = new Date(date);
        const futureDate = this.getDateFromNow(days);
        return targetDate >= this.mockCurrentDate && targetDate <= futureDate;
    }

    // Get mock dates for events
    getMockEventDates() {
        return {
            // Movies - next few days
            movies: [
                this.getDateFromNow(1),  // Tomorrow
                this.getDateFromNow(2),  // Day after tomorrow
                this.getDateFromNow(3),  // 3 days from now
                this.getDateFromNow(5)   // 5 days from now
            ],
            // Stage Plays - next 2 weeks
            stagePlays: [
                this.getDateFromNow(4),  // 4 days from now
                this.getDateFromNow(7),  // 1 week from now
                this.getDateFromNow(10)  // 10 days from now
            ],
            // Live Orchestra - next 3 weeks
            orchestra: [
                this.getDateFromNow(6),  // 6 days from now
                this.getDateFromNow(9),  // 9 days from now
                this.getDateFromNow(12), // 12 days from now
                this.getDateFromNow(15)  // 15 days from now
            ]
        };
    }

    // Format date for display
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    }

    // Format time for display
    formatTime(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleTimeString('en-US', { ...defaultOptions, ...options });
    }
}

// Create a singleton instance
const dateMock = new DateMock();

module.exports = dateMock;
