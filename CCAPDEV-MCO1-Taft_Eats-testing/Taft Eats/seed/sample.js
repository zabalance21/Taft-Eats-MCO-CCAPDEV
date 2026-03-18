const mongoose = require('mongoose');
const {users, establishments, reviews} = require('../js/data'); // Sample data for the database
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');
mongoose.connect('mongodb://localhost:27017/taftEats');

const sampleData = async () => {
    try{
        // Clear existing data
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Review.deleteMany({});

        // Insert sample users and restaurants
        const createdUsers = await User.insertMany(users);
        const createdRestaurants = await Restaurant.insertMany(establishments);


        // Map reviews to proper userID and restaurantID
        const mappedReviews = reviews.map(review => {
            const user = createdUsers.find(u => u.username === review.user.username);
            const restaurant = createdRestaurants.find(r => r.id === review.restaurantId);
            return{
                ...review,
                user: user._id,
                restaurant: restaurant._id
            };
        });

        for(const rev of mappedReviews){
            const createdReview = await Review.create(rev);
            await Restaurant.findByIdAndUpdate(createdReview.restaurantId, {$inc: {reviewCount: 1}});
        }
        console.log("Sample data inserted successfully!");
        mongoose.disconnect();
    }catch(err){
        console.error(err);
    }
};
sampleData();