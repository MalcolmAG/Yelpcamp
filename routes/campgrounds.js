const express = require("express");
var router = express.Router();

const Campground    = require("../models/campground"),
      User          = require("../models/user"),
      Comment       = require("../models/comment");
const midware       = require("../middleware");
var NodeGeocoder    = require("node-geocoder");

var ng_options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

var geocoder = NodeGeocoder(ng_options);

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
router.get("/new", midware.isLoggedIn, (req, res) => {
    res.render("campground/new");
})

/**
 * CREATE - Adds a new campground to DB
 * path: /campgrounds
 */
router.post("/", midware.isLoggedIn, async (req, res) => {
    try{
        let user = await User.findById(req.user.id);

        let data = await geocoder.geocode(req.body.camp.location);
        // Location not found
        if(!data) {
            req.flash("error", "Invalid Address");
            return res.redirect("back");
        }
        console.log(data);
        var camploc = {
            lat: data[0].latitude,
            lng: data[0].longitude,
            location: data[0].formattedAddress
        }

        // Merges retrieved location data & camp object
        let camp = await Campground.create(Object.assign(camploc, req.body.camp));
        
        // Save author info to campground
        var author = {
            id: req.user.id,
            username: req.user.username
        };
        camp.author = author;
        camp.save();

        user.campgrounds.push(camp);
        user.save();
        res.redirect("/campgrounds");
    }
    catch(err) {
        return console.log(err);
    }
})

/**
 * SHOW - Shows info about one campground
 * path: /campgrounds/:slug
 */
router.get("/:slug", (req, res) => {
    // console.log();
    Campground.findOne({slug: req.params.slug}).populate("comments").exec((err, camp) => {
        if (err) return console.log(err);
        res.render("campground/show", {camp: camp});
    });
})

/**
 * EDIT - Edit info about one campground
 * path: /campgrounds/:slug/edit
 */
router.get("/:slug/edit", midware.checkCampgroundOwnership, (req, res) => {
    Campground.findOne({slug: req.params.slug}, (err, camp) => {  
        if (err) {
            req.flash("error", "Something Went Wrong");
            res.redirect("back")
        }
        res.render("campground/edit", {camp: camp});
    });
})

/**
 * UPDATE - Update a campground
 * path: /campgrounds/:slug
 */
router.put("/:slug", midware.checkCampgroundOwnership, async (req, res) => {
    try {
        let camp = await Campground.findOne({slug: req.params.slug});

        // if location is changed, then geocode (it takes a second)
        var camploc = {};
        if (camp.location != req.body.camp.location) {
            let data = await geocoder.geocode(req.body.camp.location);
            // Location not found
            if(!data) {
                req.flash("error", "Invalid Address");
                return res.redirect("back");
            }
            camploc = {
                lat: data[0].latitude,
                lng: data[0].longitude,
                location: data[0].formattedAddress
            }
        }
        /**
         * camplog must come after req.body.camp because camploc.location must override req.body.camp.location
         */
        Object.assign(camp, req.body.camp, camploc);
        await camp.save();
        res.redirect("/campgrounds/" + camp.slug);
    } catch (error) {
        console.log(error);
        res.redirect("/campgrounds");
    }
})

/**
 * DELETE - Delete all occurences of Campground. 
 * Note: Also deletes all comments associated with campground and 
 * from user campground reference
 * path: /campgrounds/:slug
 */
router.delete("/:slug", midware.checkCampgroundOwnership, (req, res) => {
    Campground.findOneAndDelete({slug: req.params.slug}, async (err, campRemoved) => {
        if (err) return console.log(err);
        let user = await User.findByIdAndUpdate(req.user.id, {
            $pull: {campgrounds: {_id: campRemoved.id}}
        })
        res.redirect("/campgrounds");
    })
})

module.exports = router;