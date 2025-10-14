# Event Ticketing System

A comprehensive event ticketing platform built with Node.js, Express.js, EJS, and MongoDB. Features QR code e-tickets, live countdown timers, and role-based access control.

## Features

### Core Functionality
- **User Authentication**: Registration and login with role-based access (Attendee/Organizer)
- **Event Management**: Create, edit, and delete events (Organizers only)
- **Ticket Booking**: Browse events and purchase tickets (Attendees)
- **Dashboard**: View ticket sales and buyer information (Organizers)

### Special Features
- **Live Countdown Timer**: Real-time countdown to event start date
- **QR Code E-Tickets**: Unique QR codes generated for each purchased ticket
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS (Embedded JavaScript templates)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Bootstrap 5, Custom CSS
- **Additional Libraries**: 
  - QRCode.js for QR code generation
  - Moment.js for date handling
  - Multer for file uploads
  - bcryptjs for password hashing

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-ticketing-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string and other environment variables

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
DB_NAME=event_ticketing

# Session Configuration
SESSION_SECRET=your-super-secret-session-key

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=public/images/events

# Application Configuration
APP_NAME=Event Ticketing System
APP_URL=http://localhost:3000
```

## Project Structure

```
event-ticketing-system/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── upload.js            # File upload middleware
├── models/
│   ├── User.js              # User model
│   ├── Event.js             # Event model
│   └── Ticket.js            # Ticket model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── events.js            # Event routes
│   └── users.js             # User routes
├── views/
│   ├── partials/
│   │   ├── header.ejs       # Header partial
│   │   └── footer.ejs       # Footer partial
│   ├── auth/
│   │   ├── login.ejs        # Login page
│   │   └── register.ejs     # Registration page
│   ├── events/
│   │   ├── index.ejs        # Events listing
│   │   ├── show.ejs         # Event details
│   │   └── create.ejs       # Create event
│   └── users/
│       ├── profile.ejs      # User profile
│       └── tickets.ejs      # User tickets
├── public/
│   ├── css/
│   │   └── style.css        # Custom styles
│   ├── js/
│   │   └── main.js          # Main JavaScript
│   └── images/
│       └── events/          # Event images
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md               # This file
```

## User Roles & Permissions

### Guest Users
- View homepage and event listings
- View event details
- Register for an account
- Login to existing account

### Attendees
- All guest permissions
- Edit personal profile
- Purchase event tickets
- View ticket history and QR codes

### Organizers
- All attendee permissions
- Create new events
- Edit/delete their own events
- View dashboard with ticket sales data
- Manage event details and pricing

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Events
- `GET /events` - List all events
- `GET /events/:id` - Get event details
- `POST /events` - Create new event (Organizers only)
- `PUT /events/:id` - Update event (Organizers only)
- `DELETE /events/:id` - Delete event (Organizers only)

### Tickets
- `POST /tickets/purchase` - Purchase ticket
- `GET /tickets/my-tickets` - Get user's tickets
- `GET /tickets/:id/qr` - Get ticket QR code

## Development

### Running in Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts on file changes.

### Database Models

#### User Model
- name, email, password
- role (attendee/organizer)
- profile information

#### Event Model
- name, description, image
- date, location
- ticket count, price
- organizer reference

#### Ticket Model
- event reference
- user reference
- purchase date
- QR code data
- status (active/used/cancelled)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
