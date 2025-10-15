# CursedTicket - Premium Entertainment Ticketing System

A comprehensive event ticketing platform built with Node.js, Express.js, EJS, and MongoDB. Features QR code e-tickets, dynamic venue selection, and role-based access control for Movies, Stage Plays, and Live Orchestra events.

## 🎫 Features

### Core Functionality

* **User Authentication**: Registration and login with role-based access (Attendee/Organizer)
* **Multi-Category Events**: Support for Movies, Stage Plays, and Live Orchestra events
* **Dynamic Venue Selection**: API-integrated venue selection with real-time loading
* **Event Management**: Create, edit, and delete events (Organizers only)
* **Ticket Booking**: Browse events and purchase tickets (Attendees)
* **QR Code E-Tickets**: Unique QR codes generated for each purchased ticket
* **Organizer Dashboard**: Statistics, ticket management, and event creation

### Special Features

* **Live Countdown Timer**: Real-time countdown to event start date
* **Responsive Design**: Mobile-friendly interface with Bootstrap 5
* **Advanced Pricing**: Support for VIP, Student, and Senior pricing tiers
* **Ticket Management**: Complete ticket lifecycle management
* **Real-time Statistics**: Live dashboard with sales analytics

## 🚀 Technology Stack

* **Backend**: Node.js, Express.js
* **Frontend**: EJS (Embedded JavaScript templates)
* **Database**: MongoDB with Mongoose ODM
* **Styling**: Bootstrap 5, Custom CSS
* **Additional Libraries**:  
   * QRCode.js for QR code generation  
   * Moment.js for date handling  
   * Multer for file uploads  
   * bcryptjs for password hashing
   * Cloudinary for image management

## 📦 Installation

1. **Clone the repository**  
```bash
git clone https://github.com/pixsphet/Even-Ticketing.git
cd Even-Ticketing
```

2. **Install dependencies**  
```bash
npm install
```

3. **Environment Setup**  
   * Copy `.env.example` to `.env`  
   * Update the MongoDB connection string and other environment variables

4. **Start the application**  
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
DB_NAME=event_ticketing

# Session Configuration
SESSION_SECRET=your-super-secret-session-key

# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=public/images/events

# Application Configuration
APP_NAME=CursedTicket
APP_URL=http://localhost:3001
```

## 📁 Project Structure

```
Even-Ticketing/
├── config/
│   ├── database.js          # Database configuration
│   └── cloudinary.js        # Cloudinary configuration
├── middleware/
│   └── permissions.js       # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Event.js             # Event model
│   ├── Ticket.js            # Ticket model
│   ├── Location.js          # Location model
│   ├── Movie.js             # Movie event model
│   ├── StagePlays.js        # Stage play event model
│   └── LiveOrchestra.js     # Orchestra event model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── events.js            # Event routes
│   ├── organizer.js         # Organizer routes
│   ├── attendee.js          # Attendee routes
│   └── guest.js             # Guest routes
├── views/
│   ├── partials/
│   │   ├── header.ejs       # Header partial
│   │   └── footer.ejs       # Footer partial
│   ├── auth/
│   │   ├── login.ejs        # Login page
│   │   ├── register.ejs     # Registration page
│   │   └── profile.ejs      # Profile page
│   ├── events/
│   │   ├── index.ejs        # Events listing
│   │   ├── show.ejs         # Event details
│   │   └── book.ejs         # Book event
│   ├── organizer/
│   │   ├── dashboard.ejs    # Organizer dashboard
│   │   ├── events.ejs       # Organizer events
│   │   └── create-event.ejs # Create event
│   ├── attendee/
│   │   ├── tickets.ejs      # User tickets
│   │   └── buy-ticket.ejs   # Buy ticket
│   └── guest/
│       ├── events.ejs       # Guest events view
│       └── event-details.ejs # Guest event details
├── public/
│   ├── css/
│   │   └── style.css        # Custom styles
│   ├── js/
│   │   ├── main.js          # Main JavaScript
│   │   ├── dropdown.js      # Dropdown functionality
│   │   └── layout.js        # Layout scripts
│   └── images/
│       └── events/          # Event images
├── scripts/
│   ├── seedData.js          # Seed data script
│   ├── seedLocations.js     # Seed locations script
│   └── createTestEvent.js   # Create test event script
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md               # This file
```

## 👥 User Roles & Permissions

### Guest Users
* View homepage and event listings
* View event details
* Register for an account
* Login to existing account

### Attendees
* All guest permissions
* Edit personal profile
* Purchase event tickets
* View ticket history and QR codes
* Manage ticket preferences

### Organizers
* All attendee permissions
* Create new events (Movies, Stage Plays, Orchestra)
* Edit/delete their own events
* View dashboard with ticket sales data
* Manage event details and pricing
* Access to venue management

## 🔌 API Endpoints

### Authentication
* `POST /auth/register` - User registration
* `POST /auth/login` - User login
* `POST /auth/logout` - User logout
* `GET /profile` - User profile

### Events
* `GET /events` - List all events
* `GET /events/:id` - Get event details
* `POST /events` - Create new event (Organizers only)
* `PUT /events/:id` - Update event (Organizers only)
* `DELETE /events/:id` - Delete event (Organizers only)

### API Endpoints
* `GET /api/events/featured` - Get featured events
* `GET /api/events/movies` - Get movie events
* `GET /api/events/stage-plays` - Get stage play events
* `GET /api/events/orchestra` - Get orchestra events
* `GET /api/locations` - Get available locations
* `GET /api/statistics` - Get system statistics

### Tickets
* `POST /tickets/purchase` - Purchase ticket
* `GET /tickets/my-tickets` - Get user's tickets
* `GET /tickets/:id/qr` - Get ticket QR code

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts on file changes.

### Database Models

#### User Model
* name, email, password
* role (attendee/organizer)
* profile information
* organizer profile (for organizers)

#### Event Models
* **Movie**: Movie-specific details (director, cast, duration, rating)
* **StagePlays**: Theater-specific details (director, cast, intermission)
* **LiveOrchestra**: Concert-specific details (conductor, program, intermission)

#### Ticket Model
* event reference
* user reference
* purchase date
* QR code data
* pricing type (regular, student, senior, VIP)
* status (active/used/cancelled/refunded)

#### Location Model
* venue information
* capacity and amenities
* venue type (cinema, theater, concert_hall)

## 🎨 Key Features

### Dynamic Venue Selection
- Real-time venue loading based on event category
- API-integrated venue management
- Automatic capacity and amenity display

### Advanced Pricing System
- Base pricing for all events
- VIP pricing for premium experiences
- Student and senior discounts
- Flexible pricing per event

### QR Code Integration
- Unique QR codes for each ticket
- Secure ticket validation
- Mobile-friendly ticket display

### Responsive Design
- Mobile-first approach
- Bootstrap 5 integration
- Custom CSS for enhanced UX
- Cross-browser compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🙏 Acknowledgments

- Bootstrap 5 for responsive design
- MongoDB for database management
- Express.js for backend framework
- All contributors and testers

---

**CursedTicket** - Premium Entertainment Ticketing System 🎫✨