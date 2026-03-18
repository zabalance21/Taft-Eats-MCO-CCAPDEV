const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {type : String, required: true, unique: true},
    fullName: String,
    avatar: String,
    description: String,
    joinedDate: Date,
    likedRestaurants: [Number],
    dislikedRestaurants: [Number],
    role: {type: String, default   : 'user'},
    establishmentId: Number ,// only for restaurant owners
    password: { type: String, required: true }
});   

module.exports = mongoose.model('User', UserSchema);