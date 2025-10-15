// Permission-based access control middleware
// Implements the role-based permission matrix

const permissions = {
  // Guest permissions (unauthenticated users)
  guest: [
    'view_homepage',
    'view_event_list', 
    'view_event_details',
    'register',
    'login'
  ],
  
  // Attendee permissions
  attendee: [
    'view_homepage',
    'view_event_list',
    'view_event_details', 
    'login',
    'edit_profile',
    'buy_tickets',
    'view_ticket_history'
  ],
  
  // Organizer permissions
  organizer: [
    'view_homepage',
    'view_event_list',
    'view_event_details',
    'login', 
    'edit_profile',
    'create_event',
    'view_own_events',
    'edit_own_event',
    'delete_own_event',
    'view_dashboard'
  ]
};

// Check if user has specific permission
const hasPermission = (userRole, permission) => {
  if (!userRole || !permissions[userRole]) {
    return false;
  }
  return permissions[userRole].includes(permission);
};

// Middleware to check specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.session.user ? req.session.user.role : 'guest';
    
    if (!hasPermission(userRole, permission)) {
      req.flash('error', 'You do not have permission to access this feature');
      
      // Redirect based on user status
      if (!req.session.user) {
        return res.redirect('/auth/login');
      } else {
        return res.redirect('/');
      }
    }
    
    next();
  };
};

// Middleware to check if user is guest (not logged in)
const requireGuest = (req, res, next) => {
  if (req.session.user) {
    req.flash('info', 'You are already logged in');
    return res.redirect('/');
  }
  next();
};

// Middleware to check if user is attendee
const requireAttendee = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Please log in to access this feature');
    return res.redirect('/auth/login');
  }
  
  if (req.session.user.role !== 'attendee') {
    req.flash('error', 'This feature is only available for attendees');
    return res.redirect('/');
  }
  
  next();
};

// Middleware to check if user is organizer
const requireOrganizer = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Please log in to access this feature');
    return res.redirect('/auth/login');
  }
  
  if (req.session.user.role !== 'organizer') {
    req.flash('error', 'This feature is only available for organizers');
    return res.redirect('/');
  }
  
  next();
};

// Middleware to check if user is logged in (attendee or organizer)
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Please log in to access this feature');
    return res.redirect('/auth/login');
  }
  next();
};

// Helper function to check permissions in templates
const checkPermission = (userRole, permission) => {
  return hasPermission(userRole, permission);
};

// Helper function to get user role
const getUserRole = (req) => {
  return req.session.user ? req.session.user.role : 'guest';
};

module.exports = {
  permissions,
  hasPermission,
  requirePermission,
  requireGuest,
  requireAttendee,
  requireOrganizer,
  requireAuth,
  checkPermission,
  getUserRole
};


