const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

// @route GET api/auth
// @desc Test route
// @access Public - can be accessed without token
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public - can be accessed without token
router.post(
    '/', 
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Error 400 is a bad request due to missing info
            // Response of 200 means everything is ok
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password} = req.body;

        try {
            //Check for user credentials
            let user = await User.findOne({ email });

            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            //Check if email and password match
            //Compare raw input password with encrypted password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

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
