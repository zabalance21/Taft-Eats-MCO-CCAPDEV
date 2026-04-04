// =======================
// Dependencies
// =======================
require('dotenv').config();
const express = require('express');
const hbs = require('hbs');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

const User = require('./Taft Eats/models/User');
const Restaurant = require('./Taft Eats/models/Restaurant');
const Review = require('./Taft Eats/models/Review');
const { establishments } = require('./Taft Eats/js/data');
const { syncRestaurantStats } = require('./utils/restaurantUtils');

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const establishmentRoutes = require('./routes/establishments');
const reviewRoutes = require('./routes/reviews');

const app = express();

// =======================
// Handlebars Setup
// =======================
hbs.registerHelper('eq', (a, b) => a === b);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'Taft Eats', 'views'));
hbs.registerPartials(path.join(__dirname, 'Taft Eats', 'views', 'partials'));

// =======================
// Middleware
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Taft Eats')));

// =======================
// MongoDB Connection
// =======================
mongoose.connect(process.env.MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 5000,
}).then(async () => {
    // Backfill rating and reviewCount for every restaurant
    const restaurants = await Restaurant.find().lean();
    for (const rest of restaurants) {   
        await syncRestaurantStats(rest._id);
    }
    console.log('rating and reviewCount synced for all restaurants');

    // Backfill likedRestaurants / dislikedRestaurants for every user
    const allUsers = await User.find();
    for (const user of allUsers) {
        const userReviews = await Review.find({ user: user._id }).populate('restaurant').lean();
        user.likedRestaurants = [];
        user.dislikedRestaurants = [];
        for (const rev of userReviews) {
            if (!rev.restaurant) continue;
            const rid = rev.restaurant.id;
            if (rev.rating >= 3) {
                if (!user.likedRestaurants.includes(rid)) user.likedRestaurants.push(rid);
            } else {
                if (!user.dislikedRestaurants.includes(rid)) user.dislikedRestaurants.push(rid);
            }
        }
        await user.save();
    }
    console.log('likedRestaurants / dislikedRestaurants synced for all users');
});

// =======================
// Session & Cookie Setup
// =======================
app.use(session({
    secret: "secret-key", // change to an environment variable in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,   // set to true if using HTTPS
        httpOnly: true,  // prevents JS access (XSS protection)
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));
app.use(cookieParser());
app.use(flash());

// Makes session user available to ALL Handlebars templates via res.locals
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.userInitial = req.session.user
        ? req.session.user.username.charAt(0).toUpperCase()
        : null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// =======================
// Home Route
// =======================
app.get('/', async function (req, res) {
    const allRestaurants = await Restaurant.find().lean();
    const allReviews = await Review.find().lean();

    const topRestaurants = allRestaurants.map(rest => {
        const restReviews = allReviews.filter(r => r.restaurant.toString() === rest._id.toString());
        const avgRating = restReviews.length > 0
            ? restReviews.reduce((sum, r) => sum + r.rating, 0) / restReviews.length
            : 0;
        const staticData = establishments.find(e => e.id === rest.id) || {};
        return {
            id: rest.id,
            name: rest.name,
            image: staticData.image || '',
            description: staticData.description || '',
            rating: parseFloat(avgRating.toFixed(1)),
            ratingWhole: Math.round(avgRating),
            reviewCount: restReviews.length
        };
    }).sort((a, b) => b.rating - a.rating).slice(0, 5);

    const allHomepageReviews = await Review.find()
        .populate('user')
        .populate('restaurant')
        .lean();

    // Randomize reviews each reload, prioritizing reviews with media
    const shuffle = (items) => {
        const arr = [...items];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const reviewsWithMedia = allHomepageReviews.filter(r => typeof r.media === 'string' && r.media.trim() !== '');
    const reviewsWithoutMedia = allHomepageReviews.filter(r => !(typeof r.media === 'string' && r.media.trim() !== ''));

    const selectedReviews = shuffle(reviewsWithMedia).slice(0, 5);
    if (selectedReviews.length < 5) {
        const needed = 5 - selectedReviews.length;
        selectedReviews.push(...shuffle(reviewsWithoutMedia).slice(0, needed));
    }

    const reviews = selectedReviews.map(obj => ({
        _id: obj._id,
        rating: obj.rating,
        body: obj.body,
        media: obj.media || '',
        username: obj.user?.username || 'Anonymous',
        avatar: obj.user?.avatar || 'assets/images/sample-user1.jpg',
        restaurantName: obj.restaurant?.name || 'Unknown',
    }));

    res.render('index', { reviews, topRestaurants });
});

// =======================
// About Route
// =======================
app.get('/about', (req, res) => {
    res.render('about');
});

// =======================
// Mount Routes
// =======================
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', establishmentRoutes);
app.use('/', reviewRoutes);

// =======================
// Start Server
// =======================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});