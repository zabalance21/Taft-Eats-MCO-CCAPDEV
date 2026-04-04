const {body} = require('express-validator');

const registerValidation = [
    body('fullname')
        .not().isEmpty().withMessage("Full name is required")
        .isLength({min:2}).withMessage("Full name must be at least 2 characters"),

    body('username')
        .not().isEmpty().withMessage("Username is required")
        .isLength({min:3}).withMessage("Username must be at least 3 characters")
        .isAlphanumeric().withMessage("Username must only contain letters and numbers"),

    body('password')
        .not().isEmpty().withMessage("Password is required")
        .isLength({min:2}).withMessage("Password must be at least 6 characters"),

    body('passwordfinal')
        .not().isEmpty().withMessage("Please confirm your password")
        .custom((value, {req}) => {
            if(value != req.body.password){
                throw new Error ("Passwords must match");
            }
            return true;
        }),
];

const loginValidation = [
    body('username')
        .not().isEmpty().withMessage("Username is required."),
    body('password')
        .not().isEmpty().withMessage('Password is required.')
];

const reviewValidation = [
    body('title')
        .not().isEmpty().withMessage("Review title is required.")
        .isLength({min:3}).withMessage("Title must be at least 3 characters"),

    body('body')
        .not().isEmpty().withMessage("Review body is required.")
        .isLength({min:10}).withMessage("Review must be at least 10 characters"),

    body('rating')
        .not().isEmpty().withMessage("Please select a rating")
        .isInt({min:1,max:5}).withMessage("Rating must be between 1 and 5")

    
];

module.exports = {registerValidation, loginValidation, reviewValidation}