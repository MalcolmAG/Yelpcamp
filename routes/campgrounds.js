const express = require("express");
var router = express.Router();

const Campground    = require("../models/campground"),
      User          = require("../models/user"),
      Comment       = require("../models/comment");
const midware       = require("../middleware");

/**
 * INDEX - Show all Campgrounds
 * path: /campgrounds
 */
router.get("/", (req, res) => {
    Campground.find({}, (err, campgrounds) =>{
        if (err) return console.log(err);
        res.render("campground/index", {"campgrounds": campgrounds});
    }) 
})

/**
 * NEW - Displays form to make a new campground
 * path: /campgrounds/new
 */
// 
router.get("/new", midware.isLoggedIn, (req, res) => {
    res.render("campground/new");
})

/**
 * CREATE - Adds a new campground to DB
 * path: /campgrounds
 */
// 
router.post("/", midware.isLoggedIn, async (req, res) => {
    try{
        let camp = await Campground.create(req.body.camp);
        let user = await User.findById(req.user.id);
        
        // Save author info to campground
        var author = {
            id: req.user.id,
            username: req.user.username
        };
        camp.author = author;
        camp.save();

        // Save camp id in user
        var campinfo = {
            _id: camp.id,
            name: camp.name 
        }
        user.campgrounds.push(campinfo);
        user.save();
        res.redirect("/campgrounds");
    }
    catch(err) {
        return console.log(err);
    }
})

/**
 * SHOW - Shows info about one campground
 * path: /campgrounds/:id
 */
router.get("/:id", (req, res) => {
    // console.log(req.params.id);
    Campground.findById(req.params.id).populate("comments").exec((err, camp) => {
        if (err) return console.log(err);
        res.render("campground/show", {camp: camp});
    });
})

/**
 * EDIT - Edit info about one campground
 * path: /campgrounds/:id/edit
 */
router.get("/:id/edit", midware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, camp) =>{  
        if (err) {
            req.flash("error", "Something Went Wrong");
            res.redirect("back")
        }
        res.render("campground/edit", {camp: camp});
    });
})

/**
 * UPDATE - Update a campground
 * path: /campgrounds/:id
 */
// 
router.put("/:id", midware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.camp, (err, camp) => {
        if (err) return console.log(err);
        // console.log(camp); // gives back old one
        res.redirect("/campgrounds/" + req.params.id);
    });
})

/**
 * DELETE - Delete all occurences of Campground. 
 * Note: Also deletes all comments associated with campground and 
 * from user campground reference
 * path: /campgrounds/:id
 */
router.delete("/:id", midware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndDelete(req.params.id, async (err, campRemoved) => {
        if (err) return console.log(err);
        let user = await User.findByIdAndUpdate(req.user.id, {
            $pull: {campgrounds: {_id: req.params.id}}
        })
        console.log(user);
        res.redirect("/campgrounds");
    })
})

module.exports = router;