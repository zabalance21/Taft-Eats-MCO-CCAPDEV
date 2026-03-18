// =======================
// Dependencies
// =======================
const express = require('express');
// web framework for Node.js, handles routing and middleware

const hbs = require('hbs');
// Handlebars templating engine for Express
// Renders .hbs files as HTML pages with dynamic data

const multer = require('multer');
// handles multipart/form-data (file uploads)
// Used specifically for review media uploads
// NOTE: not used globally, only on /review/submit route

const mongoose = require('mongoose');
// MongoDB object modeling for Node.js
// Lets us define schemas and interact with MongoDB using JS

const User = require('./Taft Eats/models/User');
const Restaurant = require('./Taft Eats/models/Restaurant');
const Review = require('./Taft Eats/models/Review');
// each maps to a MongoDB collection
// User = users, Restaurant = restaurants, Review = reviews

const path = require('path');
// built-in Node.js module
// Helps build file/directory paths that work on all operating systems

const fileUpload = require('express-fileupload');
// simpler alternative to multer for file uploads
// Used only on /register and /edit-profile routes
// NOT used globally because it conflicts with multer

const session = require('express-session');
// manages user sessions
// Stores logged-in user info (id, username) server-side across requests

const flash = require('connect-flash');

const bcrypt = require('bcrypt');

const cookieParser = require('cookie-parser');
// parses cookies from incoming requests
// Works alongside express-session to read session cookies

const { establishments } = require('./Taft Eats/js/data');
// data.js — static hardcoded data from the original frontend
// Still used for the /establishments page filtering
const app = express();

const {validationResult} = require('express-validator')

// =======================
// Handlebars Setup
// =======================
// 'eq' helper allows {{#if (eq a b)}} comparisons in .hbs templates
// Used for pre-selecting dropdowns (e.g. rating, establishment) when editing
hbs.registerHelper('eq', (a, b) => a === b);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'Taft Eats', 'views'));
hbs.registerPartials(path.join(__dirname, 'Taft Eats', 'views', 'partials')); // shared partials like footer
const { registerValidation, loginValidation } = require('./validators.js'); 


// =======================
// Middleware
// =======================
app.use(express.json()); // parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // parses form submissions (req.body)
app.use(express.static(path.join(__dirname, 'Taft Eats'))); // serves static files (css, js, images)

// Multer - handles file uploads for review media
// Files are saved to assets/images/uploads/ with a timestamp filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'Taft Eats/assets/images/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
// NOTE: express-fileupload() is NOT used globally — it conflicts with multer
// It is only applied to /register and /edit-profile routes via fileUpload()

// =======================
// MongoDB Connection
// =======================
// CHANGED: Added .then() callback so we can backfill reviewCount for every
// restaurant after the connection is ready. This fixes the stale 0 values
// that were left over because create/delete routes never updated the field.
mongoose.connect('mongodb://localhost:27017/taftEats').then(async () => {
    // Backfill reviewCount for every restaurant.
    const restaurants = await Restaurant.find().lean();
    for (const rest of restaurants) {
        const count = await Review.countDocuments({ restaurant: rest._id });
        await Restaurant.findByIdAndUpdate(rest._id, { reviewCount: count });
    }
    console.log('reviewCount synced for all restaurants');

    // CHANGED: Backfill likedRestaurants / dislikedRestaurants for every user
    // based on their existing reviews (>=3 stars = liked, <=2 stars = disliked).
    // This fixes the stale empty arrays for all users that reviewed before this
    // logic was in place.
    const allUsers = await User.find();
    for (const user of allUsers) {
        const userReviews = await Review.find({ user: user._id }).populate('restaurant').lean();
        // Rebuild from scratch to ensure correctness.
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
    secret: "secret-key",   // change this to an environment variable in production
    resave: false,
    saveUninitialized: false,
}));
app.use(cookieParser());
app.use(flash());

// Makes session user available to ALL Handlebars templates via res.locals
// Access in .hbs as {{user.username}} or {{userInitial}} without passing it manually
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
// CHANGED: Previously rendered index.hbs with no data (res.render('index')).
// The "What People Are Saying" section used hardcoded review cards with
// static numeric IDs (0, 5, 10, etc.) that don't exist in MongoDB.
// Then it was switched to latest reviews, but now it shows 5 RANDOM reviews
// on every page load, while prioritizing reviews that have media/images.
// This keeps cards fresh per refresh and highlights richer review content.
app.get('/', async function (req, res) {
    // Fetch top-reviewed restaurants with real review counts and ratings from DB
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

    // CHANGED: Randomize review order each reload while prioritizing reviews
    // that include uploaded media. If there are not enough media reviews,
    // fill the remaining slots with random non-media reviews.
    const shuffle = (items) => {
        const arr = [...items];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const reviewsWithMedia = allHomepageReviews.filter(r => {
        return typeof r.media === 'string' && r.media.trim() !== '';
    });
    const reviewsWithoutMedia = allHomepageReviews.filter(r => {
        return !(typeof r.media === 'string' && r.media.trim() !== '');
    });

    const selectedReviews = shuffle(reviewsWithMedia).slice(0, 5);
    if (selectedReviews.length < 5) {
        const needed = 5 - selectedReviews.length;
        selectedReviews.push(...shuffle(reviewsWithoutMedia).slice(0, needed));
    }

    const reviews = selectedReviews.map(obj => {
        return {
            _id: obj._id,
            rating: obj.rating,
            body: obj.body,
            media: obj.media || '',
            username: obj.user?.username || 'Anonymous',
            avatar: obj.user?.avatar || 'assets/images/sample-user1.jpg',
            restaurantName: obj.restaurant?.name || 'Unknown',
        };
    });

    res.render('index', { reviews, topRestaurants });
});

// =======================
// Auth Routes
// =======================

// Show login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
// Finds user by username, checks password, saves user to session
app.post('/login', loginValidation, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('error_msg', errors.array()[0].msg);
        return res.redirect('/login');
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        req.flash('error_msg', 'Invalid username or password.');
        return res.redirect('/login');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        req.flash('error_msg', 'Invalid username or password.');
        return res.redirect('/login');  
    }

    req.session.user = {
        id: user._id,
        username: user.username
    };

    res.redirect('/');
});

// Show register page
app.get('/register', (req, res) => {
    res.render('register');
});

// Handle register form submission
// fileUpload() middleware applied here only — handles avatar upload via express-fileuspload
app.post('/register', fileUpload(), async (req, res) => {
    
     // Run validation manually after body is parsed by fileUpload()
    await Promise.all(registerValidation.map(v => v.run(req)));
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log('Validation errors:', errors.array());
        req.flash('error_msg', errors.array()[0].msg);
        return res.redirect('/register')
    }

    const { fullname, username, password } = req.body;

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        req.flash('error_msg', 'User already exists. Please login.');
        return res.redirect('/login');
    }

    const saltRounds = 10;

    let avatar = '/assets/images/sample-user.jpeg';
    if (req.files && req.files.picture) {
        const pic = req.files.picture;
        const uploadPath = path.join(__dirname, 'Taft Eats', 'assets', 'images', 'uploads', pic.name);
        await pic.mv(uploadPath);
        avatar = '/assets/images/uploads/' + pic.name;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);

    const newUser = new User({
        fullName: fullname,
        username,
        password: hashedPassword,
        avatar,
        joinedDate: new Date(),
        description: "",
        likedRestaurants: [],
        dislikedRestaurants: []
    });

    try {
        await newUser.save();
        console.log('User saved with hashed password:', newUser.password);
        req.session.user = { id: newUser._id, username: newUser.username };
        req.flash('success_msg', 'You are now registered! Login below.');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/register');
    }

});

// Destroy session and redirect to home
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// =======================
// Profile Routes
// =======================

// Show profile page
// Fetches user, their reviews, and maps each review to its restaurant name
app.get('/profile', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const userId = req.session.user.id;
    const user = await User.findById(userId).lean();
    const userReviews = await Review.find({ user: userId }).lean();

    // Calculate how many days since the user joined
    const joinedDate = new Date(user.joinedDate);
    const today = new Date();
    const diffDays = Math.floor((today - joinedDate) / (1000 * 60 * 60 * 24));

    const restaurants = await Restaurant.find().lean();

    // CHANGED: If user is an owner, fetch their restaurant's reviews and rating
    // instead of the owner's own reviews. Shows customer reviews for their establishment.
    const isOwner = user.role === 'owner' && user.establishmentId;
    // likedCount/dislikedCount default to 0; computed below for regular users only.
    let latestReviews, totalReviews, avgRating, avgRatingStars, likedCount = 0, dislikedCount = 0;

    if (isOwner) {
        const restaurant = restaurants.find(r => r.id === user.establishmentId);
        if (restaurant) {
            const restaurantReviews = await Review.find({ restaurant: restaurant._id })
                .populate('user')
                .sort({ date: -1 })
                .lean();
            totalReviews = restaurantReviews.length;
            avgRating = totalReviews > 0
                ? (restaurantReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
                : '0.0';
            avgRatingStars = '★'.repeat(Math.round(parseFloat(avgRating)));
            latestReviews = restaurantReviews.map(r => ({
                id: r._id,
                date: new Date(r.date).toLocaleDateString(),
                edited: r.edited,
                reviewerName: r.user?.fullName || r.user?.username || 'Anonymous',
                restaurantName: restaurant.name,
                ratingStars: '★'.repeat(r.rating),
                title: r.title,
                body: r.body
            }));
        } else {
            totalReviews = 0;
            avgRating = '0.0';
            avgRatingStars = '';
            latestReviews = [];
        }
    } else {
        totalReviews = userReviews.length;

        // CHANGED: Compute liked/disliked counts.
        // Priority 1: if the user has explicitly clicked the Like/Dislike buttons on
        //             an establishment page, use those saved arrays from MongoDB.
        // Priority 2: fall back to distinct restaurants the user rated >= 4 (liked)
        //             or <= 2 (disliked), so counts are never stuck at 0 by default.
        const explicitLiked = user.likedRestaurants ? user.likedRestaurants.length : 0;
        const explicitDisliked = user.dislikedRestaurants ? user.dislikedRestaurants.length : 0;
        if (explicitLiked > 0 || explicitDisliked > 0) {
            likedCount = explicitLiked;
            dislikedCount = explicitDisliked;
        } else {
            const likedIds = new Set(userReviews.filter(r => r.rating >= 4).map(r => r.restaurant.toString()));
            const dislikedIds = new Set(userReviews.filter(r => r.rating <= 2).map(r => r.restaurant.toString()));
            likedCount = likedIds.size;
            dislikedCount = dislikedIds.size;
        }

        // Get last 5 reviews, most recent first
        // Maps each review to include restaurant name and formatted stars
        latestReviews = userReviews.slice(-5).reverse().map(r => {
            const restaurant = restaurants.find(rest => rest._id.toString() === r.restaurant.toString());
            return {
                id: r._id,
                date: new Date(r.date).toLocaleDateString(),
                edited: r.edited,
                restaurantName: restaurant ? restaurant.name : "Unknown",
                ratingStars: "★".repeat(r.rating)
            };
        });
    }

    res.render('profile', {
        user,
        latestReviews,
        joinedDate: diffDays,
        totalReviews,
        isOwner,
        avgRating,
        avgRatingStars,
        // CHANGED: Pass computed counts so the template can display them.
        likedCount,
        dislikedCount
    });
});

// Show edit profile page
app.get('/edit-profile', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const user = await User.findById(req.session.user.id).lean();
    res.render('edit-profile', { user });
});

// Handle edit profile form submission
// fileUpload() middleware applied here only — handles avatar upload via express-fileupload
app.post('/edit-profile', fileUpload(), async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    // Guard against req.body being undefined (e.g. if multipart fields are missing)
    const { description } = req.body || {};
    const user = await User.findById(req.session.user.id);

    if (description) {
        user.description = description;
    }

    // Update avatar if a new file was uploaded
    if (req.files && req.files.avatar) {
        const avatarFile = req.files.avatar;
        const uniqueName = Date.now() + '_' + avatarFile.name;
        const uploadPath = path.join(__dirname, 'Taft Eats', 'assets', 'images', 'uploads', avatarFile.name);
        await avatarFile.mv(uploadPath);
        user.avatar = '/assets/images/uploads/' + uniqueName;
    }

    await user.save();

    // Keep session in sync so navbar reflects updated info immediately
    req.session.user.description = user.description;
    req.session.user.avatar = user.avatar;
    res.redirect('profile');
});

// =======================
// Establishments Routes
// =======================

// Show all establishments
// Filters by keyword (name/description) and minimum rating from query params
// CHANGED: Now computes each establishment's rating dynamically from actual
// reviews in MongoDB instead of using the hardcoded rating from data.js.
// This keeps the card rating in sync with the reviews page rating.
app.get('/establishments', async (req, res) => {
    const keyword = req.query.search?.toLowerCase() || "";
    const minRating = parseFloat(req.query.rating) || 0;

    const allRestaurants = await Restaurant.find().lean();
    const allReviews = await Review.find().lean();

    const enriched = allRestaurants.map(rest => {
        const restReviews = allReviews.filter(r => r.restaurant.toString() === rest._id.toString());
        const avgRating = restReviews.length > 0
            ? (restReviews.reduce((sum, r) => sum + r.rating, 0) / restReviews.length)
            : 0;
        const staticData = establishments.find(e => e.id === rest.id) || {};
        return {
            id: rest.id,
            name: rest.name,
            rating: parseFloat(avgRating.toFixed(1)),
            description: staticData.description || '',
            image: staticData.image || ''
        };
    });

    const filtered = enriched.filter(est => {
        const matchedKeyword = est.name.toLowerCase().includes(keyword) ||
            est.description.toLowerCase().includes(keyword);
        const matchedRating = est.rating >= minRating;
        return matchedKeyword && matchedRating;
    });

    res.render('establishments', { establishments: filtered, searchKeyword: keyword });
});

// Show single establishment with its reviews
// Populates user info on each review for display (avatar, fullName, username)
app.get('/establishments/:id', async (req, res) => {
    const keyword = req.query.search?.toLowerCase() || "";
    const restaurantId = parseInt(req.params.id);

    const restaurant = await Restaurant.findOne({ id: restaurantId });
    let reviews = await Review.find({ restaurant: restaurant._id }).populate('user');

    // Filter reviews by search keyword if provided
    if (keyword) {
        reviews = reviews.filter(r =>
            r.title.toLowerCase().includes(keyword) ||
            r.body.toLowerCase().includes(keyword)
        );
    }

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0;
    const stars = '★'.repeat(Math.round(avgRating));

    const currentUsername = req.session?.user?.username;
    const currentUser = await User.findOne({ username: currentUsername });

    // isOwner — true if logged-in user owns this establishment
    // Controls visibility of "Respond" button on reviews
    // CHANGED: Fixed field name from establishmentID to establishmentId
    // to match the seed data and User schema.
    const isOwner = currentUser &&
        currentUser.role === "owner" &&
        currentUser.establishmentId === restaurantId;

    // CHANGED: Derive the logged-in user's current restaurant vote state
    // so the Like/Dislike buttons can render as active on page load.
    const userLiked = !!(currentUser &&
        Array.isArray(currentUser.likedRestaurants) &&
        currentUser.likedRestaurants.includes(restaurantId));
    const userDisliked = !!(currentUser &&
        Array.isArray(currentUser.dislikedRestaurants) &&
        currentUser.dislikedRestaurants.includes(restaurantId));

    // Process reviews to add computed fields that Handlebars can't compute
    // toObject() converts Mongoose document to plain JS object for Handlebars
    const currentUserId = req.session?.user?.id;
    const processedReviews = reviews.map(r => {
        const obj = r.toObject();
        const userVote = currentUserId
            ? (obj.helpfulVotes?.some(id => id.toString() === currentUserId.toString()) ? 'helpful'
              : obj.unhelpfulVotes?.some(id => id.toString() === currentUserId.toString()) ? 'unhelpful'
              : null)
            : null;
        return {
            ...obj,
            stars: '★'.repeat(Math.round(r.rating)),
            formattedDate: new Date(r.date).toLocaleDateString(),
            isReviewOwner: r.user.username === currentUsername, // controls Edit/Delete button visibility
            votedHelpful: userVote === 'helpful',
            votedUnhelpful: userVote === 'unhelpful'
        };
    });

    res.render('establishment-reviews', {
        restaurant,
        reviews: processedReviews,
        reviewCount: processedReviews.length,
        avgRating: avgRating.toFixed(1),
        stars,
        isOwner,
        currentUser,
        userLiked,
        userDisliked
    });
});

// Handle restaurant like/dislike toggle
// CHANGED: Added missing route used by main.js (POST /establishments/:id/like)
// to persist user restaurant preferences in MongoDB.
app.post('/establishments/:id/like', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        const restaurantId = parseInt(req.params.id);
        if (Number.isNaN(restaurantId)) {
            return res.status(400).json({ error: 'Invalid restaurant id' });
        }

        const { type } = req.body;
        if (type !== 'like' && type !== 'dislike') {
            return res.status(400).json({ error: 'Invalid reaction type' });
        }

        const restaurant = await Restaurant.findOne({ id: restaurantId });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Ensure arrays exist for older user documents.
        if (!Array.isArray(user.likedRestaurants)) user.likedRestaurants = [];
        if (!Array.isArray(user.dislikedRestaurants)) user.dislikedRestaurants = [];

        // CHANGED: Use .includes() instead of .indexOf() since we now use
        // Mongoose .pull(value) which only needs the value, not an index.
        const alreadyLiked = user.likedRestaurants.includes(restaurantId);
        const alreadyDisliked = user.dislikedRestaurants.includes(restaurantId);

        if (type === 'like') {
            if (alreadyLiked) {
                // Toggle off existing like.
                // CHANGED: use Mongoose .pull() instead of .splice() so the
                // array mutation is tracked and written to MongoDB on .save().
                user.likedRestaurants.pull(restaurantId);
            } else {
                // Switch from dislike to like (or add like if no vote yet).
                if (alreadyDisliked) {
                    user.dislikedRestaurants.pull(restaurantId);
                }
                user.likedRestaurants.push(restaurantId);
            }
        } else {
            if (alreadyDisliked) {
                // Toggle off existing dislike.
                user.dislikedRestaurants.pull(restaurantId);
            } else {
                // Switch from like to dislike (or add dislike if no vote yet).
                if (alreadyLiked) {
                    user.likedRestaurants.pull(restaurantId);
                }
                user.dislikedRestaurants.push(restaurantId);
            }
        }

        await user.save();

        return res.json({
            liked: user.likedRestaurants.includes(restaurantId),
            disliked: user.dislikedRestaurants.includes(restaurantId)
        });
    } catch (err) {
        console.error('Restaurant like/dislike error:', err);
        return res.status(500).json({ error: 'Server error while updating restaurant reaction' });
    }
});

// =======================
// Review Routes
// =======================

// Show create review page
// selectedRestaurantId — passed from "Write a Review" button on establishment page
// If present, pre-selects and locks the establishment dropdown
app.get('/review/create', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const establishments = await Restaurant.find();
    const selectedRestaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId) : null;
    const selectedRestaurant = selectedRestaurantId
        ? await Restaurant.findOne({ id: selectedRestaurantId })
        : null;

    res.render('create-review', {
        establishments,
        selectedRestaurantId,
        selectedRestaurantName: selectedRestaurant?.name || null,
        reviewToEdit: null // null = create mode, not edit mode
    });
});

// Show edit review page
// Reuses create-review.hbs — reviewToEdit being non-null switches it to edit mode
// populate('restaurant') needed to access restaurant.id and restaurant.name
app.get('/review/edit/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const establishments = await Restaurant.find();
    const review = await Review.findById(req.params.id).populate('restaurant');

    if (!review) return res.status(404).send("Review not found");

    // Only the review owner can edit
    if (review.user.toString() !== req.session.user.id.toString()) {
        return res.status(403).send("Unauthorized");
    }

    res.render('create-review', {
        establishments,
        selectedRestaurantId: review.restaurant.id,
        selectedRestaurantName: review.restaurant.name,
        reviewToEdit: review.toObject() // toObject() converts to plain JS for Handlebars
    });
});

// Show single review page
// CHANGED: Moved AFTER /review/create and /review/edit/:id so those specific
// paths are matched first. Previously this was defined first and caught
// /review/create as :id = "create", causing a MongoDB CastError.
app.get('/review/:id', async (req, res) => {
    const review = await Review.findById(req.params.id).populate('user').populate('restaurant');
    if (!review) return res.status(404).send('Review not found');

    const obj = review.toObject();
    const currentUserId = req.session?.user?.id;
    const userVote = currentUserId
        ? (obj.helpfulVotes?.some(id => id.toString() === currentUserId.toString()) ? 'helpful'
          : obj.unhelpfulVotes?.some(id => id.toString() === currentUserId.toString()) ? 'unhelpful'
          : null)
        : null;

    res.render('review', {
        review: {
            ...obj,
            stars: '★'.repeat(Math.round(review.rating)),
            formattedDate: new Date(review.date).toLocaleDateString(),
            votedHelpful: userVote === 'helpful',
            votedUnhelpful: userVote === 'unhelpful'
        }
    });
});

// Handle review form submission (create and edit)
// upload.single('media') — multer handles the optional media file upload
// If reviewId is present in body = editing, otherwise = creating
app.post('/review/submit', upload.single('media'), async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const { reviewId, restaurantId, title, body, rating } = req.body;

    // reviewId is intentionally excluded — it's optional (only present when editing)
    if (!restaurantId || !title || !body || !rating) {
        return res.status(400).send("Please fill in all required fields");
    }

    const parsedRating = parseInt(rating);
    if (parsedRating < 1 || parsedRating > 5) {
        return res.status(400).send("Invalid rating");
    }

    const restaurant = await Restaurant.findOne({ id: parseInt(restaurantId) });
    if (!restaurant) return res.status(404).send("Restaurant not found");

    const mediaPath = req.file ? `assets/images/uploads/${req.file.filename}` : "";

    if (reviewId) {
        // Edit existing review — keep old media if no new file uploaded
        const review = await Review.findById(reviewId);
        await Review.findByIdAndUpdate(reviewId, {
            title,
            body,
            rating: parsedRating,
            media: req.file ? mediaPath : review.media,
            edited: true,
            date: new Date()
        });

        // CHANGED: When a review is edited, recalculate the user's like/dislike
        // for this restaurant based on the new rating (>=3 = liked, <=2 = disliked).
        // Pull from both first to avoid duplicates, then push into the correct one.
        const reviewerEdit = await User.findById(req.session.user.id);
        if (reviewerEdit) {
            reviewerEdit.likedRestaurants.pull(restaurant.id);
            reviewerEdit.dislikedRestaurants.pull(restaurant.id);
            if (parsedRating >= 3) {
                reviewerEdit.likedRestaurants.push(restaurant.id);
            } else {
                reviewerEdit.dislikedRestaurants.push(restaurant.id);
            }
            await reviewerEdit.save();
        }
    } else {
        // Create new review — helpful/unhelpful/date/edited use schema defaults
        await Review.create({
            restaurant: restaurant._id,
            user: req.session.user.id,
            title,
            body,
            rating: parsedRating,
            media: mediaPath
        });
        // CHANGED: Increment reviewCount in the restaurant document so the
        // DB field stays in sync with the actual number of reviews.
        await Restaurant.findByIdAndUpdate(restaurant._id, { $inc: { reviewCount: 1 } });

        // CHANGED: Add restaurant to likedRestaurants (>=3 stars) or
        // dislikedRestaurants (<=2 stars) of the reviewing user.
        // Pull first to prevent duplicates if the user somehow reviews twice.
        const reviewer = await User.findById(req.session.user.id);
        if (reviewer) {
            reviewer.likedRestaurants.pull(restaurant.id);
            reviewer.dislikedRestaurants.pull(restaurant.id);
            if (parsedRating >= 3) {
                reviewer.likedRestaurants.push(restaurant.id);
            } else {
                reviewer.dislikedRestaurants.push(restaurant.id);
            }
            await reviewer.save();
        }
    }

    res.redirect(`/establishments/${restaurantId}`);
});

// Handle review deletion
// restaurantId passed as hidden input in the delete form for redirect after deletion
app.post('/review/delete/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const review = await Review.findById(req.params.id).populate('restaurant');
    if (!review) return res.status(404).send("Review not found");

    await Review.findByIdAndDelete(req.params.id);
    // CHANGED: Decrement reviewCount so the DB field stays in sync after deletion.
    await Restaurant.findByIdAndUpdate(review.restaurant._id, { $inc: { reviewCount: -1 } });

    // CHANGED: Remove the restaurant from the user's liked/disliked arrays
    // when their review is deleted, since their rating signal no longer exists.
    const reviewOwner = await User.findById(req.session.user.id);
    if (reviewOwner) {
        reviewOwner.likedRestaurants.pull(review.restaurant.id);
        reviewOwner.dislikedRestaurants.pull(review.restaurant.id);
        await reviewOwner.save();
    }

    res.redirect(`/establishments/${req.body.restaurantId}`);
});

// =======================
// Owner Response Routes
// =======================

// Handle owner writing a reply to a review
// Only restaurant owners can respond to reviews on their establishment
app.post('/review/respond/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const review = await Review.findById(req.params.id).populate('restaurant');
    if (!review) return res.status(404).send('Review not found');

    const user = await User.findById(req.session.user.id);
    if (!user || user.role !== 'owner' || user.establishmentId !== review.restaurant.id) {
        return res.status(403).send('Unauthorized: Only the restaurant owner can respond');
    }

    const { ownerResponse } = req.body;
    if (!ownerResponse || !ownerResponse.trim()) {
        return res.status(400).send('Response cannot be empty');
    }

    review.ownerResponse = ownerResponse.trim();
    await review.save();

    res.redirect(`/establishments/${review.restaurant.id}`);
});

// Handle owner editing an existing reply
// Reuses the same form — updates the ownerResponse field
app.post('/review/respond/edit/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const review = await Review.findById(req.params.id).populate('restaurant');
    if (!review) return res.status(404).send('Review not found');

    const user = await User.findById(req.session.user.id);
    if (!user || user.role !== 'owner' || user.establishmentId !== review.restaurant.id) {
        return res.status(403).send('Unauthorized: Only the restaurant owner can edit their response');
    }

    const { ownerResponse } = req.body;
    if (!ownerResponse || !ownerResponse.trim()) {
        return res.status(400).send('Response cannot be empty');
    }

    review.ownerResponse = ownerResponse.trim();
    await review.save();

    res.redirect(`/establishments/${review.restaurant.id}`);
});

// Handle helpful/unhelpful vote toggle
// type = "helpful" or "unhelpful"
// Toggles the user's vote: adds if not voted, removes if already voted
// A user can only vote helpful OR unhelpful on a review, not both
app.post('/review/vote/:id', async (req, res) => {
    try {
        console.log('Vote request:', req.params.id, req.body, req.session.user);
        if (!req.session.user) return res.status(401).json({ error: "Not logged in" });

        const { type } = req.body;
        if (type !== 'helpful' && type !== 'unhelpful') {
            return res.status(400).json({ error: "Invalid vote type" });
        }

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: "Review not found" });

        // Initialize vote arrays for reviews created before this feature existed
        if (!review.helpfulVotes) review.helpfulVotes = [];
        if (!review.unhelpfulVotes) review.unhelpfulVotes = [];

        const userId = req.session.user.id;
        const oppositeType = type === 'helpful' ? 'unhelpful' : 'helpful';
        const voteField = type + 'Votes';
        const oppositeField = oppositeType + 'Votes';

        const alreadyVoted = review[voteField].some(id => id.toString() === userId.toString());
        const hadOppositeVote = review[oppositeField].some(id => id.toString() === userId.toString());

        if (alreadyVoted) {
            // Remove vote (toggle off)
            review[voteField].pull(userId);
            review[type] -= 1;
        } else {
            // Remove opposite vote if exists
            if (hadOppositeVote) {
                review[oppositeField].pull(userId);
                review[oppositeType] -= 1;
            }
            // Add this vote
            review[voteField].push(userId);
            review[type] += 1;
        }

        await review.save();

        res.json({
            helpful: review.helpful,
            unhelpful: review.unhelpful,
            userVote: alreadyVoted ? null : type
        });
    } catch (err) {
        console.error('Vote error:', err);
        res.status(500).json({ error: "Server error while voting" });
    }
});

// =======================
// Start Server
// =======================
// CHANGED from 5000 to 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});