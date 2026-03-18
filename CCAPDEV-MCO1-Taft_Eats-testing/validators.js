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

module.exports = {registerValidation, loginValidation}