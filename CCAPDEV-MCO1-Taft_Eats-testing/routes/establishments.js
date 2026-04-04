const express = require('express');
const router = express.Router();
const User = require('../Taft Eats/models/User');
const Restaurant = require('../Taft Eats/models/Restaurant');
const Review = require('../Taft Eats/models/Review');
const { establishments } = require('../Taft Eats/js/data');

// =======================
// Establishments Routes
// =======================

// Show all establishments
// Filters by keyword (name/description) and minimum rating from query params
router.get('/establishments', async (req, res) => {
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
router.get('/establishments/:id', async (req, res) => {
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
    const isOwner = currentUser &&
        currentUser.role === "owner" &&
        currentUser.establishmentId === restaurantId;

    // Derive the logged-in user's current restaurant vote state
    // so the Like/Dislike buttons can render as active on page load.
    const userLiked = !!(currentUser &&
        Array.isArray(currentUser.likedRestaurants) &&
        currentUser.likedRestaurants.includes(restaurantId));
    const userDisliked = !!(currentUser &&
        Array.isArray(currentUser.dislikedRestaurants) &&
        currentUser.dislikedRestaurants.includes(restaurantId));

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
            isReviewOwner: r.user.username === currentUsername,
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
router.post('/establishments/:id/like', async (req, res) => {
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

        if (!Array.isArray(user.likedRestaurants)) user.likedRestaurants = [];
        if (!Array.isArray(user.dislikedRestaurants)) user.dislikedRestaurants = [];

        const alreadyLiked = user.likedRestaurants.includes(restaurantId);
        const alreadyDisliked = user.dislikedRestaurants.includes(restaurantId);

        if (type === 'like') {
            if (alreadyLiked) {
                user.likedRestaurants.pull(restaurantId);
            } else {
                if (alreadyDisliked) user.dislikedRestaurants.pull(restaurantId);
                user.likedRestaurants.push(restaurantId);
            }
        } else {
            if (alreadyDisliked) {
                user.dislikedRestaurants.pull(restaurantId);
            } else {
                if (alreadyLiked) user.likedRestaurants.pull(restaurantId);
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

module.exports = router;