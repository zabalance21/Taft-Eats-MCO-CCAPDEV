require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {users, establishments, reviews} = require('../js/data'); // Sample data for the database
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');

mongoose.connect(process.env.MONGODB_URI);

const sampleData = async () => {
    try{
        // Clear existing data
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Review.deleteMany({});

        // Hash all passwords before inserting
        const saltRounds = 10;
        const hashedUsers = await Promise.all(users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            return {
                ...user,
                password: hashedPassword
            };
        }));

        // Insert sample users and restaurants
        const createdUsers = await User.insertMany(hashedUsers);
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
            await Restaurant.findByIdAndUpdate(createdReview.restaurant, {$inc: {reviewCount: 1}});
        }
        console.log("Sample data inserted successfully!");
        console.log("Passwords have been hashed for security.");
        mongoose.disconnect();
    }catch(err){
        console.error(err);
    }
};
sampleData();