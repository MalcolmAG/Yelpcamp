// All Middleware
const Campground    = require("../models/campground"),
      Comment       = require("../models/comment");

middlewareObj = {
    isLoggedIn: function(req, res, next){
        if (req.isAuthenticated()){
            return next();
        }
        req.flash("error", "Please Login First");
        res.redirect("/login");
    },
    checkCommentOwnership: function(req, res, next){
        if(!req.isAuthenticated()) {
            req.flash("error", "Please Login First")
            return res.redirect("back");
        }
        Comment.findById(req.params.commentId, (err, comment) =>{
            if (err) {
                req.flash("error", "Something Went Wrong");
                return res.redirect("back")
            }
            // if user & author are the same
            if (comment.author.id.equals(req.user.id) || req.user.isAdmin){
                next();
            } else {
                req.flash("error", "You don't have permission to do that")
                return res.redirect("back");
            }
        });
    },
    checkCampgroundOwnership: function(req, res, next){
        if(!req.isAuthenticated()) {
            // return res.status(401).location('/login').end();
            return res.redirect("back");
        }
        Campground.findById(req.params.id, (err, camp) =>{
            if (err) return res.redirect("back")
            // if user & author are the same
            if (camp.author.id.equals(req.user.id) || req.user.isAdmin){
                next();
            } else {
                res.redirect("back");
            }
        });
    },
    p: function(item){
        var objType = typeof(item);
        console.log("type: " + objType + "| value: " + item);
    }
}

module.exports = middlewareObj;