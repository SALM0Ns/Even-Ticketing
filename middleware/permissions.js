// Middleware for role-based access control

// Require user to be logged in
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }
  next();
};

// Require user to be an attendee
const requireAttendee = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }
  
  if (req.session.user.role !== 'attendee') {
    req.flash('error', 'Access denied. This page is for attendees only.');
    return res.redirect('/');
  }
  
  next();
};

// Require user to be an organizer
const requireOrganizer = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }
  
  if (req.session.user.role !== 'organizer') {
    req.flash('error', 'Access denied. This page is for organizers only.');
    return res.redirect('/');
  }
  
  next();
};

// Require user to be an admin (if you have admin role)
const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }
  
  if (req.session.user.role !== 'admin') {
    req.flash('error', 'Access denied. This page is for administrators only.');
    return res.redirect('/');
  }
  
  next();
};

// Allow both attendees and organizers
const requireUser = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }
  
  if (!['attendee', 'organizer', 'admin'].includes(req.session.user.role)) {
    req.flash('error', 'Access denied. Invalid user role.');
    return res.redirect('/');
  }
  
  next();
};

// Guest access (no authentication required)
const allowGuest = (req, res, next) => {
  // Always allow access, whether user is logged in or not
  next();
};

// Redirect authenticated users away from guest pages
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // Redirect based on user role
    switch (req.session.user.role) {
      case 'attendee':
        return res.redirect('/attendee/dashboard');
      case 'organizer':
        return res.redirect('/organizer/dashboard');
      case 'admin':
        return res.redirect('/admin/dashboard');
      default:
        return res.redirect('/');
    }
  }
  next();
};

module.exports = {
  requireAuth,
  requireAttendee,
  requireOrganizer,
  requireAdmin,
  requireUser,
  allowGuest,
  redirectIfAuthenticated
};