const express = require('express');
const router = express.Router();
const path = require('path');
const fileUpload = require('express-fileupload');
const User = require('../Taft Eats/models/User');
const Restaurant = require('../Taft Eats/models/Restaurant');
const Review = require('../Taft Eats/models/Review');

// =======================
// Profile Routes
// =======================

// Show profile page
// Fetches user, their reviews, and maps each review to its restaurant name
router.get('/profile', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const userId = req.session.user.id;
    const user = await User.findById(userId).lean();
    const userReviews = await Review.find({ user: userId }).lean();

    // Calculate how many days since the user joined
    const joinedDate = new Date(user.joinedDate);
    const today = new Date();
    const diffDays = Math.floor((today - joinedDate) / (1000 * 60 * 60 * 24));

    const restaurants = await Restaurant.find().lean();

    // If user is an owner, fetch their restaurant's reviews and rating
    // instead of the owner's own reviews. Shows customer reviews for their establishment.
    const isOwner = user.role === 'owner' && user.establishmentId;
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

        // Compute liked/disliked counts.
        // Priority 1: use explicitly clicked Like/Dislike arrays from MongoDB.
        // Priority 2: fall back to ratings (>=4 liked, <=2 disliked).
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
        likedCount,
        dislikedCount
    });
});

// Show edit profile page
router.get('/edit-profile', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const user = await User.findById(req.session.user.id).lean();
    res.render('edit-profile', { user });
});

// Handle edit profile form submission
// fileUpload() middleware applied here only — handles avatar upload via express-fileupload
router.post('/edit-profile', fileUpload(), async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const { description } = req.body || {};
    const user = await User.findById(req.session.user.id);

    if (description) {
        user.description = description;
    }

    // Update avatar if a new file was uploaded
    if (req.files && req.files.avatar) {
        const avatarFile = req.files.avatar;
        const uniqueName = Date.now() + '_' + avatarFile.name;
        const uploadPath = path.join(__dirname, '..', 'Taft Eats', 'assets', 'images', 'uploads', avatarFile.name);
        await avatarFile.mv(uploadPath);
        user.avatar = '/assets/images/uploads/' + uniqueName;
    }

    await user.save();

    // Keep session in sync so navbar reflects updated info immediately
    req.session.user.description = user.description;
    req.session.user.avatar = user.avatar;
    res.redirect('profile');
});

module.exports = router;