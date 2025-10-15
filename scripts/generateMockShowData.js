// Mock data generator for individual show seating
// This creates sample data that can be used to test the individual show seating feature

function generateRandomTakenSeats(totalSeats, takenPercentage = 0.3) {
  const numTakenSeats = Math.floor(totalSeats * takenPercentage);
  const takenSeats = [];
  
  // Generate unique random seat numbers
  while (takenSeats.length < numTakenSeats) {
    const seatNumber = Math.floor(Math.random() * totalSeats) + 1;
    if (!takenSeats.includes(seatNumber)) {
      takenSeats.push(seatNumber);
    }
  }
  
  return takenSeats.sort((a, b) => a - b);
}

function generateShowDates(baseDate, numShows = 5) {
  const showDates = [];
  const base = new Date(baseDate);
  
  for (let i = 0; i < numShows; i++) {
    const showDate = new Date(base);
    showDate.setDate(base.getDate() + i);
    showDate.setHours(19 + (i % 3), 0, 0, 0); // 7 PM, 8 PM, 9 PM rotation
    showDates.push(showDate);
  }
  
  return showDates;
}

// Example usage - this would be the data structure for individual show seating
const mockEventData = {
  name: "Hamilton",
  category: "stage-plays",
  showDates: [
    {
      date: new Date("2024-12-20T19:00:00Z"),
      seating: {
        totalSeats: 180,
        takenSeats: generateRandomTakenSeats(180, 0.4), // 40% taken
        availableSeats: 0 // Will be calculated
      }
    },
    {
      date: new Date("2024-12-21T20:00:00Z"),
      seating: {
        totalSeats: 180,
        takenSeats: generateRandomTakenSeats(180, 0.6), // 60% taken
        availableSeats: 0
      }
    },
    {
      date: new Date("2024-12-22T21:00:00Z"),
      seating: {
        totalSeats: 180,
        takenSeats: generateRandomTakenSeats(180, 0.3), // 30% taken
        availableSeats: 0
      }
    }
  ]
};

// Calculate available seats
mockEventData.showDates.forEach(show => {
  show.seating.availableSeats = show.seating.totalSeats - show.seating.takenSeats.length;
});

console.log("Mock Individual Show Data:");
console.log(JSON.stringify(mockEventData, null, 2));

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateRandomTakenSeats,
    generateShowDates,
    mockEventData
  };
}
