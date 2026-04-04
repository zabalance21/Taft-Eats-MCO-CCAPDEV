const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const { reviewValidation } = require('../validators');
const upload = require('../middleware/upload');
const User = require('../Taft Eats/models/User');
const Restaurant = require('../Taft Eats/models/Restaurant');
const Review = require('../Taft Eats/models/Review');
const { syncRestaurantStats } = require('../utils/restaurantUtils');

// =======================
// Review Routes
// =======================

// Show create review page
// selectedRestaurantId — passed from "Write a Review" button on establishment page
router.get('/review/create', async (req, res) => {
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
router.get('/review/edit/:id', async (req, res) => {
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
        reviewToEdit: review.toObject()
    });
});

// Show single review page
// IMPORTANT: Must stay AFTER /review/create and /review/edit/:id
// so those paths are matched first before :id catches them.
router.get('/review/:id', async (req, res) => {
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
router.post('/review/submit',
    (req, res, next) => {
        upload.single("media")(req, res, function (err) {
            const restaurantId = req.body.restaurantId || "";
            if (err) {
                req.flash("error_msg", err.message);
                return res.redirect(`/review/create?restaurantId=${restaurantId}`);
            }
            next();
        });
    },
    reviewValidation,
    async (req, res) => {
        if (!req.session.user) return res.redirect('/login');

        const errors = validationResult(req);
        const restaurantId = req.body.restaurantId || "";
        if (!errors.isEmpty()) {
            req.flash('error_msg', errors.array()[0].msg);
            return res.redirect(`/review/create?restaurantId=${restaurantId}`);
        }

        const { reviewId, title, body, rating } = req.body;
        const parsedRating = parseInt(rating);

        if (parsedRating < 1 || parsedRating > 5) {
            req.flash('error_msg', "Invalid rating");
            return res.redirect(`/review/create?restaurantId=${restaurantId}`);
        }

        const restaurant = await Restaurant.findOne({ id: parseInt(restaurantId) });
        if (!restaurant) return res.status(404).send("Restaurant not found");

        const mediaPath = req.file ? `assets/images/uploads/${req.file.filename}` : "";

        if (reviewId) {
            // Edit existing review
            const review = await Review.findById(reviewId);
            await Review.findByIdAndUpdate(reviewId, {
                title,
                body,
                rating: parsedRating,
                media: req.file ? mediaPath : review.media,
                edited: true,
                date: new Date()
            });

            await syncRestaurantStats(restaurant._id);

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
            // Create new review
            await Review.create({
                restaurant: restaurant._id,
                user: req.session.user.id,
                title,
                body,
                rating: parsedRating,
                media: mediaPath
            });

            await syncRestaurantStats(restaurant._id);

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
    }
);

// Handle review deletion
router.post('/review/delete/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const review = await Review.findById(req.params.id).populate('restaurant');
    if (!review) return res.status(404).send("Review not found");

    await Review.findByIdAndDelete(req.params.id);
    await syncRestaurantStats(review.restaurant._id);

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
router.post('/review/respond/:id', async (req, res) => {
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
router.post('/review/respond/edit/:id', async (req, res) => {
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
router.post('/review/vote/:id', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ error: "Not logged in" });

        const { type } = req.body;
        if (type !== 'helpful' && type !== 'unhelpful') {
            return res.status(400).json({ error: "Invalid vote type" });
        }

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: "Review not found" });

        if (!review.helpfulVotes) review.helpfulVotes = [];
        if (!review.unhelpfulVotes) review.unhelpfulVotes = [];

        const userId = req.session.user.id;
        const oppositeType = type === 'helpful' ? 'unhelpful' : 'helpful';
        const voteField = type + 'Votes';
        const oppositeField = oppositeType + 'Votes';

        const alreadyVoted = review[voteField].some(id => id.toString() === userId.toString());
        const hadOppositeVote = review[oppositeField].some(id => id.toString() === userId.toString());

        if (alreadyVoted) {
            review[voteField].pull(userId);
            review[type] -= 1;
        } else {
            if (hadOppositeVote) {
                review[oppositeField].pull(userId);
                review[oppositeType] -= 1;
            }
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

module.exports = router;