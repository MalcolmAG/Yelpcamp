const express = require("express");
var router = express.Router();
const User = require("../models/user");

router.get("/user/:username", (req, res) => {
    User.findOne({username: req.params.username}).populate("comments").populate("campgrounds").exec((err, user) => {
        if (err) return console.log(err);
        console.log(user);
        res.render("user/show.ejs", {user: user});
    })
})

module.exports = router;