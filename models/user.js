const mongoose = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const commment = require("./comment");

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    campgrounds: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Campground"
            },
            name: String
        }
    ],
    
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);