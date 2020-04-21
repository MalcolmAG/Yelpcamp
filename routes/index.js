const express   = require("express"),
      passport  = require("passport");

const User = require("../models/user");

var router = express.Router();

// HomePage Route
router.get("/", (req, res) => {
    res.render("landing");
})

/**
 * NEW REGISTER - registration form
 * path: /register
 */ 
router.get("/register", (req, res) => {
    res.render("user/register")
})
/**
 * CREATE REGISTER - new user
 * path: /register
 */ 
router.post("/register", (req, res) => {
    var newUser = new User({email: req.body.email, username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.render("user/register", {err: err})
        }
        passport.authenticate("local")(req, res, ()=>{
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    })
})

/**
 * LOGIN - login form
 * path: /login
 */
router.get("/login", (req, res) =>{
    res.render("user/login")
})
/**
 * LOGIN - authenticate login
 * path: /login
 */
router.post('/login', 
    passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: 'Invalid username or password.'
    })
);

/**
 * LOGOUT - logout
 * path: /logout
 */
router.get("/logout", (req, res) => {
    req.flash("success", "Logged Out");
    // Passport version
    req.logout();
    res.redirect('/');
})

/**
 * PAGE NOT FOUND
 * path: *
 */
router.get("*", (req, res) => {
    req.flash("error", "Page Not Found");
    res.redirect("/")
})

module.exports = router;