const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // If there are validation errors, send a response and return
        return res.status(404).json({ success, errors: errors.array() });
    }

    try {
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            console.log("where")
            // If user already exists, send a response and return
            return res.status(404).send("User already exists");
        }

        var salt = bcrypt.genSaltSync(10);
        var secPass = bcrypt.hashSync(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });

        const data = {
            user: {
                id: user.id
            }
        };

        const authToken = jwt.sign(data, process.env.JWT_SECRET);
        success = true;

        // Send the success response
        res.json({ success, authToken });
    } catch (e) {
        // If an error occurs, send an error response
        res.status(404).send({ success, msg: e.message });
    }
});

module.exports = router;
