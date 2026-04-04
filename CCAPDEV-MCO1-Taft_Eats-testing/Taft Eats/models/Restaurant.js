const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    id: {type : Number, required: true, unique: true},
    name: String,
    rating: Number,
    description: String,
    image: String,
    reviewCount: {type: Number, default: 0}
});   

module.exports = mongoose.model('Restaurant', RestaurantSchema);