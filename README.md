# Taft Eats - Restaurant Review Web Application

A comprehensive full-stack web application for discovering and reviewing restaurants. Taft Eats allows users to explore establishments, read authentic reviews from the community, and share their own dining experiences with a secure backend and responsive frontend.

## Overview

Taft Eats is a full-stack restaurant review platform designed to help food enthusiasts discover excellent dining options and share their culinary experiences. The application combines a Node.js/Express backend with a Handlebars-templated frontend, MongoDB database integration, and comprehensive user management. Whether you're looking for recommendations or want to contribute your own reviews, Taft Eats makes it easy to connect with fellow food lovers.

## Features

✨ **User Authentication & Authorization**
- Secure user registration and login with bcrypt password hashing
- Session-based authentication with express-session
- Personalized user profiles with customizable descriptions
- Profile picture upload functionality
- Role-based access control (user/restaurant owner)
- Password validation and confirmation

🍽️ **Restaurant Discovery & Management**
- Browse all establishments in the platform
- Advanced search functionality across restaurants
- Filter restaurants by rating
- View detailed establishment information with complete review history
- Restaurant statistics (rating, review count) updated in real-time
- Establishment profiles with images and descriptions

⭐ **Review System**
- Submit detailed reviews with ratings (1-5 stars)
- Review title, body, and optional media attachments
- Mark reviews as helpful or unhelpful with vote tracking
- Prevent duplicate votes from same user
- View comprehensive rating distributions for each establishment
- Owner responses to reviews
- Review edit tracking

👤 **User Profiles**
- View your profile with review statistics
- Track total reviews submitted
- Monitor liked and disliked restaurants
- View latest reviews in one place
- Edit profile information and picture
- User activity tracking (joined date)

🔍 **Search & Navigation**
- Global search functionality across the platform
- Search by establishment name
- Search within reviews
- Dynamic filtering and sorting

## Project Architecture

### Full-Stack Structure

```
CCAPDEV-MCO1-Taft_Eats-testing/
├── index.js                        # Express server entry point
├── package.json                    # Dependencies and scripts
├── validators.js                   # Input validation rules (register, login, review)
├── Taft Eats/                      # Frontend application root
│   ├── views/                      # Handlebars templates
│   │   ├── index.hbs              # Home page
│   │   ├── login.hbs              # User login
│   │   ├── register.hbs           # User registration
│   │   ├── profile.hbs            # User profile
│   │   ├── edit-profile.hbs       # Edit profile
│   │   ├── establishments.hbs     # Browse restaurants
│   │   ├── establishment-reviews.hbs  # Restaurant reviews
│   │   ├── create-review.hbs      # Create review
│   │   ├── review.hbs             # View review details
│   │   ├── about.hbs              # About page
│   │   └── partials/              # Reusable components
│   │       ├── navbar.hbs         # Navigation bar
│   │       ├── footer.hbs         # Footer
│   │       └── messages.hbs       # Alert messages
│   ├── models/                     # Mongoose data models
│   │   ├── User.js               # User schema
│   │   ├── Restaurant.js         # Restaurant schema
│   │   └── Review.js             # Review schema
│   ├── css/
│   │   └── main.css              # Main stylesheet
│   ├── js/
│   │   ├── jquery-4.0.0.min.js   # jQuery library
│   │   ├── data.js               # Restaurant data and utilities
│   │   └── main.js               # Client-side JavaScript
│   ├── assets/
│   │   ├── icons/                # Application icons
│   │   ├── images/               # Images and graphics
│   │   └── images/uploads/       # User-uploaded images
│   ├── pages/
│   │   └── aboutus.html          # Static about page
│   └── seed/
│       └── sample.js             # Sample data for seeding
├── routes/                         # API Route handlers
│   ├── auth.js                   # Authentication endpoints
│   ├── profile.js                # User profile endpoints
│   ├── establishments.js         # Restaurant endpoints
│   └── reviews.js                # Review endpoints
├── middleware/                     # Custom middleware
│   └── upload.js                 # File upload configuration
└── utils/                          # Utility functions
    └── restaurantUtils.js        # Restaurant data utilities
```

## Backend Technology Stack

- **Server Framework**: Express.js 5.2.1 - Node.js web framework
- **Database**: MongoDB with Mongoose 9.2.3 - ODM for data management
- **Authentication**: bcrypt 6.0.0 - Password hashing and verification
- **Session Management**: express-session 1.19.0 - User session handling
- **Templating Engine**: Handlebars (hbs 4.2.0) - Server-side view rendering
- **File Upload**: 
  - express-fileupload 1.5.2 - Simple file upload handling
  - multer 2.1.1 - Middleware for file uploads
- **Input Validation**: express-validator - Data validation and sanitization
- **Utilities**:
  - cookie-parser 1.4.7 - Cookie parsing
  - connect-flash 0.1.1 - Flash message support
  - dotenv - Environment variable management

## Frontend Technology Stack

- **View Engine**: Handlebars (.hbs) - Server-side templated HTML
- **Markup**: HTML5
- **Styling**: CSS3
- **Client-Side Logic**: JavaScript (ES6+)
- **Library**: jQuery 4.0.0
- **Responsive Design**: CSS with mobile-friendly layouts

## Database Schemas

### User Schema
```
- username (String, unique, required)
- fullName (String)
- avatar (String) - Profile picture URL
- description (String) - User bio
- joinedDate (Date)
- likedRestaurants (Array of Numbers)
- dislikedRestaurants (Array of Numbers)
- role (String) - Default: 'user'
- establishmentId (Number) - For restaurant owners
- password (String, bcrypt hashed, required)
```

### Restaurant Schema
```
- id (Number, unique, required)
- name (String)
- rating (Number) - Average rating
- description (String)
- image (String) - Restaurant image URL
- reviewCount (Number) - Total reviews
```

### Review Schema
```
- restaurant (ObjectId, ref: Restaurant)
- user (ObjectId, ref: User)
- rating (Number) - 1-5 stars
- title (String)
- body (String)
- media (String) - Image/video URL
- helpful (Number) - Helpful vote count
- unhelpful (Number) - Unhelpful vote count
- helpfulVotes (Array of User references)
- unhelpfulVotes (Array of User references)
- ownerResponse (String) - Restaurant owner reply
- date (Date) - Review creation date
- edited (Boolean) - Edit flag
```

## API Routes

### Authentication Routes (`/auth`)
- `GET /auth/login` - Display login page
- `POST /auth/login` - Process login
- `GET /auth/register` - Display registration page
- `POST /auth/register` - Process registration
- `GET /auth/logout` - Logout user

### Profile Routes (`/profile`)
- `GET /profile` - View user profile
- `GET /profile/edit` - Edit profile page
- `POST /profile/update` - Update profile information
- `POST /profile/avatar` - Upload profile picture

### Establishments Routes (`/establishments`)
- `GET /establishments` - List all restaurants
- `GET /establishments/:id` - View specific restaurant
- `GET /establishments/:id/reviews` - Get restaurant reviews
- `POST /establishments` - Create new establishment

### Reviews Routes (`/reviews`)
- `POST /reviews` - Create new review
- `GET /reviews/:id` - View specific review
- `POST /reviews/:id/helpful` - Mark review as helpful
- `POST /reviews/:id/unhelpful` - Mark review as unhelpful
- `PUT /reviews/:id` - Edit review
- `DELETE /reviews/:id` - Delete review

## Getting Started

### Prerequisites
- **Node.js** (v14 or higher) - JavaScript runtime
- **npm** (v6 or higher) - Node package manager
- **MongoDB** - Database server running locally or MongoDB Atlas connection string
- **Environment Variables** - `.env` file with MONGODB_URI

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/zabalance21/Taft-Eats-MCO-CCAPDEV.git
   cd Taft-Eats-MCO-CCAPDEV/CCAPDEV-MCO1-Taft_Eats-testing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/taft-eats
   SESSION_SECRET=your_session_secret_key
   PORT=3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

### Initial Setup
The application will automatically synchronize restaurant data and backfill ratings when you start the server.

## How to Use

### For First-Time Users
1. Click **Register** to create an account
2. Enter your information:
   - Full Name (minimum 2 characters)
   - Username (minimum 3 alphanumeric characters)
   - Password (minimum 6 characters)
   - Confirm Password
   - Profile Picture (optional)
3. Click **Register** to confirm

### Browsing Restaurants
1. Click **View Establishments** or use the navigation menu
2. Use the search bar to find specific restaurants
3. Filter by star rating using the dropdown menu
4. Click on a restaurant to view all its reviews
5. View restaurant details, ratings, and user reviews

### Submitting a Review
1. Navigate to a restaurant's review page
2. Click **Write a Review**
3. Enter review details:
   - Review Title (minimum 3 characters)
   - Detailed Review (minimum 10 characters)
   - Star Rating (1-5 stars, required)
   - Media Attachment (image/video, optional)
4. Click **Submit Review**
5. Your review is posted immediately with your timestamp

### Managing Your Profile
1. Click your username/profile icon in the navigation bar
2. View your profile page with:
   - Your review statistics
   - Recent reviews you've written
   - Liked and disliked restaurants
   - Account information
3. Click **Edit Profile** to update:
   - Full name and description
   - Profile picture
   - Bio/about information
4. Save changes when complete

### Interacting with Reviews
- **Mark Helpful/Unhelpful**: Click thumbs up/down on reviews you find useful
- **View Owner Response**: Read restaurant owner replies to reviews
- **Edit Review**: Users can edit their own reviews (marked as edited)
- **Delete Review**: Remove your own reviews

## Rating & Review System

### 5-Star Rating Scale
- ⭐ **1 Star**: Poor experience
- ⭐⭐ **2 Stars**: Below average
- ⭐⭐⭐ **3 Stars**: Average
- ⭐⭐⭐⭐ **4 Stars**: Good experience
- ⭐⭐⭐⭐⭐ **5 Stars**: Excellent experience

### Review Statistics
- **Overall Rating**: Calculated as average of all reviews
- **Review Count**: Total number of reviews for each establishment
- **Helpful Votes**: Community feedback on review usefulness
- **Review Distribution**: Visual breakdown of ratings by star level

## Input Validation

The application enforces validation on:
- **Registration**: Full name, username uniqueness, strong passwords
- **Login**: Required username and password
- **Reviews**: Title (3+ chars), body (10+ chars), rating (1-5)
- **Profile**: Email format, password confirmation

## Future Enhancements

### Backend Improvements
- Advanced filtering and sorting by date, rating, and relevance
- Pagination for large datasets
- User role management dashboard for restaurant owners
- Restaurant analytics and insights
- Review moderation and flagging system
- Email verification and password reset functionality
- JWT token-based authentication (alternative to sessions)

### Frontend Enhancements
- Dark mode/light mode theme toggle
- Advanced search filters (cuisine type, price range, location)
- Image gallery for establishments with lazy loading
- Real-time notifications for review responses
- User following/blocking system
- Review recommendation algorithm
- Comment threads on reviews
- Social sharing features

### Integration Features
- Map integration showing restaurant locations
- Integration with popular review platforms
- Payment gateway for restaurant promotions
- SMS notifications for review responses
- Social media login (Google, Facebook)
- Restaurant reservation booking system

### Performance & Security
- Database indexing optimization
- Caching with Redis
- Rate limiting for API endpoints
- HTTPS/SSL encryption
- CORS configuration for API security
- SQL injection and XSS prevention enhancements
- Automated backup system

## Development

### Project Commands
```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run with auto-reload (requires nodemon)
npm run dev

# View logs and debug information
npm run debug
```

### Key Files & Directories
| File | Purpose |
|------|---------|
| `index.js` | Main application entry point and server configuration |
| `validators.js` | Input validation middleware and rules |
| `routes/` | API route handlers for all endpoints |
| `middleware/` | Custom middleware (file uploads, authentication) |
| `utils/` | Utility functions (restaurant data sync) |
| `Taft Eats/models/` | MongoDB schema definitions |
| `Taft Eats/views/` | Handlebars template files |

### Adding New Features

1. **Create a new route**: Add endpoint handler in `routes/`
2. **Add validation**: Update `validators.js` with new rules
3. **Create template**: Add `.hbs` file in `Taft Eats/views/`
4. **Update style**: Modify `Taft Eats/css/main.css`
5. **Add client logic**: Update `Taft Eats/js/main.js` if needed

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check connection string in `.env`
- Verify network connectivity if using MongoDB Atlas
- Check firewall and port access (default: 27017)

### Session/Authentication Problems
- Clear browser cookies and try again
- Check if `SESSION_SECRET` is set in `.env`
- Verify database contains user records

### File Upload Issues
- Check file size limits in `middleware/upload.js`
- Ensure `Taft Eats/assets/images/uploads/` directory exists and is writable
- Verify file type restrictions match your needs

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -i :3000
  kill -9 <PID>
  ```

## Authors

- **CAMPOS, DON OSWIN D.**
- **CO, JOSHUA BENEDICT B.**
- **DELOS REYES, MARTIN CARLOS R.**
- **ZERNA, RONIN P.**

## License

This project is part of CCAPDEV MCO1, MCO2, and MCO3 assignments.

---

**Enjoy using Taft Eats! Happy dining! 🍽️** 
