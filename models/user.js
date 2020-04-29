const mongoose = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const commment = require("./comment");

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    avatar: {type: String, default: "default"},
    isAdmin: {type: Boolean, default: false},
    description: {type: String, default: "default"},
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    // Don't need name, only ID - also name messes with .populate
    campgrounds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campground"
        }
    ],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);