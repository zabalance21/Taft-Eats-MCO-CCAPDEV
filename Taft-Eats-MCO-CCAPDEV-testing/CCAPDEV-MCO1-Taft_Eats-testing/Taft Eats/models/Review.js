const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    restaurant: {type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    rating: Number,
    title: String,
    body: String,
    media: String,
    helpful: {type: Number, default: 0},
    unhelpful: {type: Number, default: 0},
    helpfulVotes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    unhelpfulVotes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    ownerResponse: String,
    date: {type: Date, default: Date.now},
    edited: {type: Boolean, default: false}
});   

module.exports = mongoose.model('Review', ReviewSchema);