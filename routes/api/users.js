const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const graavatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');

// @route POST api/users
// @desc Register user
// @access Public - can be accessed without token
router.post(
    '/', 
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Error 400 is a bad request due to missing info
            // Response of 200 means everything is ok
            return res.status(400).json({ errors: errors.array() });
        }

        const {name, email, password} = req.body;

        try {
            //Check if user already exists
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            //Get user gravatar
            const avatar = graavatar.url(email, {
                s: '200', //size
                r: 'pg', //rating
                d: 'mm', //default image
            });
            
            //Create new user
            user = new User({
                name, 
                email, 
                avatar, 
                password,
            });

            //Encrypt password using BCrypt
            //Generate salt
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

            //Return jsonwebtoken
            //Payload will be the unique id we will use to identify the user
            const payload = {
                user: {
                    // Don't have to underscore id, mongoose does that
                    id: user.id
                }
            }

            jwt.sign(
                payload, 
                config.get('jwtToken'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;