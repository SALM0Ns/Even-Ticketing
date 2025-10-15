const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

const parseDateOfBirthInput = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const isoPattern = /^(\d{4})[-/](\d{2})[-/](\d{2})$/;
  const altPattern = /^(\d{2})[-/](\d{2})[-/](\d{4})$/;
  let year;
  let month;
  let day;

  if (isoPattern.test(trimmed)) {
    const matches = trimmed.match(isoPattern);
    year = Number(matches[1]);
    month = Number(matches[2]);
    day = Number(matches[3]);
  } else if (altPattern.test(trimmed)) {
    const matches = trimmed.match(altPattern);
    day = Number(matches[1]);
    month = Number(matches[2]);
    year = Number(matches[3]);
  } else {
    return null;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(utcDate.getTime())) {
    return null;
  }

  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate;
};

// Middleware to check if user is already logged in
const redirectIfLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
};

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware to check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('error', 'Please log in to access this page');
      return res.redirect('/auth/login');
    }
    
    if (!roles.includes(req.session.user.role)) {
      req.flash('error', 'You do not have permission to access this page');
      return res.redirect('/');
    }
    
    next();
  };
};

// GET /auth/register - Show registration form
router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('auth/register', {
    title: 'Register - CursedTicket',
    user: null,
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info'),
    formData: null,
    errors: []
  });
});

// POST /auth/register - Handle registration
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  body('role')
    .isIn(['attendee', 'organizer'])
    .withMessage('Please select a valid role'),
  body('companyName')
    .if(body('role').equals('organizer'))
    .notEmpty()
    .withMessage('Company name is required for organizers'),
  body('dateOfBirth')
    .if(body('role').equals('attendee'))
    .optional({ checkFalsy: true })
    .custom((value) => {
      const parsed = parseDateOfBirthInput(value);
      if (!parsed) {
        throw new Error('Please enter date of birth in DD/MM/YYYY or YYYY-MM-DD format');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Register - CursedTicket',
        user: null,
        errors: errors.array(),
        formData: req.body
      });
    }

    const { name, email, password, role, companyName, phone, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email already registered. Please use a different email or try logging in.');
      return res.render('auth/register', {
        title: 'Register - CursedTicket',
        user: null,
        formData: req.body
      });
    }

    // Create user data
    const parsedDateOfBirth = role === 'attendee' ? parseDateOfBirthInput(dateOfBirth) : null;

    const userData = {
      name,
      email,
      password,
      role,
      profile: {
        phone: phone || undefined,
        dateOfBirth: parsedDateOfBirth || undefined
      }
    };

    // Add organizer-specific data
    if (role === 'organizer') {
      userData.organizerProfile = {
        companyName
      };
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Set user session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success', `Welcome to CursedTicket! Your ${role} account has been created successfully.`);
    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'Registration failed. Please try again.');
    res.render('auth/register', {
      title: 'Register - CursedTicket',
      user: null,
      formData: req.body
    });
  }
});

// GET /auth/login - Show login form
router.get('/login', redirectIfLoggedIn, (req, res) => {
  const redirectTo = typeof req.query.redirect === 'string' ? req.query.redirect : '';

  res.render('auth/login', {
    title: 'Login - CursedTicket',
    user: null,
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info'),
    formData: null,
    errors: [],
    redirectTo
  });
});

// POST /auth/login - Handle login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Login - CursedTicket',
        user: null,
        errors: errors.array(),
        formData: req.body,
        redirectTo: req.body.redirect || ''
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.render('auth/login', {
        title: 'Login - CursedTicket',
        user: null,
        formData: req.body,
        redirectTo: req.body.redirect || ''
      });
    }

    // Check if user is active
    if (!user.isActive) {
      req.flash('error', 'Your account has been deactivated. Please contact support.');
      return res.render('auth/login', {
        title: 'Login - CursedTicket',
        user: null,
        formData: req.body,
        redirectTo: req.body.redirect || ''
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      req.flash('error', 'Invalid email or password');
      return res.render('auth/login', {
        title: 'Login - CursedTicket',
        user: null,
        formData: req.body,
        redirectTo: req.body.redirect || ''
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Set user session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success', `Welcome back, ${user.name}!`);
    
    // Redirect based on role
    const requestedRedirect = typeof req.body.redirect === 'string' ? req.body.redirect : '';
    const isSafeRedirect = requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//');

    if (user.role === 'attendee' && isSafeRedirect) {
      return res.redirect(requestedRedirect);
    }

    if (user.role === 'organizer') {
      return res.redirect('/organizer/dashboard');
    }

    return res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Login failed. Please try again.');
    res.render('auth/login', {
      title: 'Login - CursedTicket',
      user: null,
      formData: req.body,
      redirectTo: req.body.redirect || ''
    });
  }
});

// POST /auth/logout - Handle logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      req.flash('error', 'Logout failed. Please try again.');
      return res.redirect('/');
    }
    
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// GET /auth/logout - Handle logout (GET request for convenience)
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      req.flash('error', 'Logout failed. Please try again.');
      return res.redirect('/');
    }
    
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = {
  router,
  requireAuth,
  requireRole,
  redirectIfLoggedIn
};
