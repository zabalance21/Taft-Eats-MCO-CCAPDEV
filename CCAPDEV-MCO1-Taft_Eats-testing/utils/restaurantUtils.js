const Review = require('../Taft Eats/models/Review');
const Restaurant = require('../Taft Eats/models/Restaurant');

// Centralized restaurant stats recalculation.
// Keeps Restaurant.rating and Restaurant.reviewCount in sync with the
// actual reviews collection after every create/edit/delete.
async function syncRestaurantStats(restaurantObjectId) {
    const reviewDocs = await Review.find({ restaurant: restaurantObjectId })
        .select('rating')
        .lean();

    const reviewCount = reviewDocs.length;
    const avgRating = reviewCount > 0
        ? reviewDocs.reduce((sum, doc) => sum + doc.rating, 0) / reviewCount
        : 0;

    await Restaurant.findByIdAndUpdate(restaurantObjectId, {
        reviewCount,
        rating: parseFloat(avgRating.toFixed(1))
    });
}

module.exports = { syncRestaurantStats };