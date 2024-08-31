const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    role:{
        type: String,
        trim:true,
    },
    branch:{
        type: String,
        trim:true,
    },
    dateAdded: {
        type: Date,
        trim: true,
    },
    profileImage: {
        type: String,
        trim: true,
    },
    bio:{
        type: String,
        trim:true,
    },
});
userSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
    });

module.exports = mongoose.model('User', userSchema);
