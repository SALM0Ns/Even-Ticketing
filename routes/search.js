const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const StagePlays = require('../models/StagePlays');
const LiveOrchestra = require('../models/LiveOrchestra');

// Search API endpoint
router.get('/', async (req, res) => {
  try {
    const { q: query, category } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json({
        success: true,
        events: [],
        message: 'Please enter a search term'
      });
    }
    
    const searchTerm = query.trim();
    const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive search
    
    let events = [];
    
    // Search based on category
    if (category === 'all' || !category) {
      // Search all event types
      const [movies, stagePlays, orchestra] = await Promise.all([
        searchMovies(searchRegex),
        searchStagePlays(searchRegex),
        searchLiveOrchestra(searchRegex)
      ]);
      
      events = [...movies, ...stagePlays, ...orchestra];
    } else {
      // Search specific category
      switch (category) {
        case 'movies':
          events = await searchMovies(searchRegex);
          break;
        case 'stage-plays':
          events = await searchStagePlays(searchRegex);
          break;
        case 'orchestra':
          events = await searchLiveOrchestra(searchRegex);
          break;
        case 'dance':
          // For now, dance events are part of stage plays
          events = await searchStagePlays(searchRegex, 'dance');
          break;
        default:
          events = [];
      }
    }
    
    // Sort events by relevance (name matches first, then description)
    events.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const bNameMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // If both or neither match by name, sort by date
      return new Date(a.showDates[0]) - new Date(b.showDates[0]);
    });
    
    res.json({
      success: true,
      events: events,
      total: events.length,
      query: searchTerm,
      category: category || 'all'
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed. Please try again.',
      error: error.message
    });
  }
});

// Helper function to search movies
async function searchMovies(searchRegex, type = null) {
  try {
    const query = {
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { director: searchRegex },
        { cast: searchRegex },
        { genre: searchRegex }
      ]
    };
    
    if (type) {
      query.type = type;
    }
    
    const movies = await Movie.find(query)
      .select('name description poster showDates location price eventType _id')
      .limit(10);
    
    return movies.map(movie => ({
      ...movie.toObject(),
      eventType: 'movies'
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}

// Helper function to search stage plays
async function searchStagePlays(searchRegex, type = null) {
  try {
    const query = {
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { director: searchRegex },
        { cast: searchRegex },
        { genre: searchRegex }
      ]
    };
    
    if (type) {
      query.type = type;
    }
    
    const stagePlays = await StagePlays.find(query)
      .select('name description poster showDates location price eventType _id')
      .limit(10);
    
    return stagePlays.map(play => ({
      ...play.toObject(),
      eventType: 'stage-plays'
    }));
  } catch (error) {
    console.error('Error searching stage plays:', error);
    return [];
  }
}

// Helper function to search live orchestra
async function searchLiveOrchestra(searchRegex) {
  try {
    const query = {
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { conductor: searchRegex },
        { composer: searchRegex },
        { genre: searchRegex }
      ]
    };
    
    const orchestra = await LiveOrchestra.find(query)
      .select('name description poster showDates location price eventType _id')
      .limit(10);
    
    return orchestra.map(event => ({
      ...event.toObject(),
      eventType: 'orchestra'
    }));
  } catch (error) {
    console.error('Error searching live orchestra:', error);
    return [];
  }
}

// Get popular search terms
router.get('/popular', async (req, res) => {
  try {
    // This could be enhanced to track actual search terms
    const popularTerms = [
      'Dune',
      'Oppenheimer',
      'Hamilton',
      'Phantom of the Opera',
      'Swan Lake',
      'Beethoven',
      'Chopin',
      'Inception',
      'Kill Bill'
    ];
    
    res.json({
      success: true,
      popularTerms: popularTerms
    });
  } catch (error) {
    console.error('Error getting popular terms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular search terms'
    });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }
    
    const searchRegex = new RegExp(query, 'i');
    const suggestions = [];
    
    // Get suggestions from all event types
    const [movieNames, playNames, orchestraNames] = await Promise.all([
      Movie.find({ name: searchRegex }).select('name').limit(3),
      StagePlays.find({ name: searchRegex }).select('name').limit(3),
      LiveOrchestra.find({ name: searchRegex }).select('name').limit(3)
    ]);
    
    // Combine and deduplicate suggestions
    const allNames = [
      ...movieNames.map(m => m.name),
      ...playNames.map(p => p.name),
      ...orchestraNames.map(o => o.name)
    ];
    
    const uniqueSuggestions = [...new Set(allNames)].slice(0, 5);
    
    res.json({
      success: true,
      suggestions: uniqueSuggestions
    });
    
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions'
    });
  }
});

module.exports = router;
