const mongoose = require('mongoose');

// Schema - the json data structure to be stored in mongoDB
const ProfileSchema = new mongoose.Schema({
    // By linking the object ID, the user model is referenced here
    // which can be use to populate user model parameters
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    company: {
        type: String
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    bio: {
        type: String
    },
    githubusername: {
        type: String
    },
    experiences: [
        {
            title: {
                type: String,
                required: true
            },
            company: {
                type: String,
                required: true
            },
            location: {
                type: String,
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: String,
            },
            current: {
                type: Boolean,
                ddefault: false
            },
            description: {
                type: String,
            },
        }
    ],
    education: [
        {
            school: {
                type: String,
                required: true
            },
            degree: {
                type: String,
                required: true
            },
            fieldofstudy: {
                type: String,
                required: true
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: String,
            },
            current: {
                type: Boolean,
                ddefault: false
            },
            description: {
                type: String,
            },
        }
    ],
    social: {
        youtube: {
            type: String,
        },
        twitter: {
            type: String,
        },
        facebook: {
            type: String,
        },
        linkedin: {
            type: String,
        },
        instagram: {
            type: String,
        },
    },
    
    date: {
        type: Date,
        dedfault: Date.now
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema)