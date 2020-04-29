const express = require("express");
var router = express.Router();
const User = require("../models/user");

router.get("/user/:name", async (req, res) => {
    try{
        let user = await User.findOne({username: req.params.name});
        // console.log(user);
        var opts = [
            {path: "campgrounds"},
            {path: "comments"}
        ]
        var populatedUser = await User.populate(user, opts)
        // console.log(populatedUser);
        res.render("user/show.ejs", {user: user});
    }
    catch (err) {
        console.log(err);
    }
})

module.exports = router;