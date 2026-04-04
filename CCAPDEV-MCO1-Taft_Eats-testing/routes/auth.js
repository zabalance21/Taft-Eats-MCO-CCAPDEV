const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const fileUpload = require('express-fileupload');
const { validationResult } = require('express-validator');
const { loginValidation, registerValidation } = require('../validators');
const User = require('../Taft Eats/models/User');

// =======================
// Auth Routes
// =======================

// Show login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
// Finds user by username, checks password, saves user to session
router.post('/login', loginValidation, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('error_msg', errors.array()[0].msg);
        return res.redirect('/login');
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        req.flash('error_msg', 'Invalid username or password.');
        return res.redirect('/login');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        req.flash('error_msg', 'Invalid username or password.');
        return res.redirect('/login');
    }

    req.session.user = {
        id: user._id,
        username: user.username
    };

    res.redirect('/');
});

// Show register page
router.get('/register', (req, res) => {
    res.render('register');
});

// Handle register form submission
// fileUpload() middleware applied here only — handles avatar upload via express-fileupload
router.post('/register', fileUpload(), async (req, res) => {
    // Run validation manually after body is parsed by fileUpload()
    await Promise.all(registerValidation.map(v => v.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        req.flash('error_msg', errors.array()[0].msg);
        return res.redirect('/register');
    }

    const { fullname, username, password } = req.body;

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        req.flash('error_msg', 'User already exists. Please login.');
        return res.redirect('/login');
    }

    const saltRounds = 10;

    let avatar = '/assets/images/sample-user.jpeg';
    if (req.files && req.files.picture) {
        const pic = req.files.picture;
        const uploadPath = path.join(__dirname, '..', 'Taft Eats', 'assets', 'images', 'uploads', pic.name);
        await pic.mv(uploadPath);
        avatar = '/assets/images/uploads/' + pic.name;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
        fullName: fullname,
        username,
        password: hashedPassword,
        avatar,
        joinedDate: new Date(),
        description: "",
        likedRestaurants: [],
        dislikedRestaurants: []
    });

    try {
        await newUser.save();
        req.session.user = { id: newUser._id, username: newUser.username };
        req.flash('success_msg', 'You are now registered! Login below.');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/register');
    }
});

// Destroy session and redirect to home
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;