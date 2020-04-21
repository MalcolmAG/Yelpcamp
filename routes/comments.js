const express = require("express");
var router = express.Router({mergeParams: true});

const Campground    = require("../models/campground"),
      Comment       = require("../models/comment"),
      User          = require("../models/user");
const midware       = require("../middleware");

/**
 * NEW - new comment form
 * path: /campgrounds/:id/comments
 */ 
router.get("/new", midware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, camp) => {
        if (err) return console.log(err);
        res.render("comment/new", {campground: camp});
    })  
})

/**
 * CREATE - adds comment to db and campground
 * path: /campgrounds/:id
 */
router.post("/", midware.isLoggedIn, async (req, res) => {
    try{
        let camp = await Campground.findById(req.params.id);
        let newComment = await Comment.create(req.body.comment);
        let user = await User.findById(req.user.id);
        author = {
            id: req.user.id,
            username: req.user.username
        }
        newComment.author = author;
        newComment.save()

        // Add Auth to Comment
        camp.comments.push(newComment);
        camp.save();
        user.comments.push(newComment);
        user.save();
        // req.flash("success", "Comment Added");

        res.redirect("/campgrounds/" + req.params.id);
    }
    catch(err){
        console.log(err);
        req.flash("error", "Something Went Wrong");
        res.redirect("/campgrounds/");
    }
})

/**
 * EDIT - Renders Edit form for comment
 * path: /campgrounds/:id/comments/:commentId/edit
 */
router.get("/:commentId/edit", midware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.commentId, (err, comment) => {
        res.render("comment/edit", {comment: comment, campId: req.params.id});
    });
    
})

/**
 * UPDATE - Updates comment with new text
 * path: /campgrounds/:id/comments/:commentId
 */
router.put("/:commentId", midware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, (err, comment) => {
        if (err) {
            req.flash("error", "Something Went Wrong");
            console.log(err);
            res.redirect("back")
        } 
        // req.flash("success", "Comment Edited");
        res.redirect("/campgrounds/" + req.params.id);
    });
})

/**
 * DELETE - deletes all occurences of comment in db
 * Note: also deletes from user and campground 
 * path: /campgrounds/:id/comments/:commentId
 */
router.delete("/:commentId", midware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndDelete(req.params.commentId, async (err, commentRemoved) => {
        if (err) {
            req.flash("error", "Something Went Wrong");
            console.log(err);
            return res.redirect("back");
        } 
        await Campground.findByIdAndUpdate(req.params.id, {
            $pull: {comments: req.params.commentId}
        })
        let user = await User.findByIdAndUpdate(req.user.id, {
            $pull: {comments: req.params.commentId}
        })
        req.flash("success", "Comment Deleted");
        res.redirect("/campgrounds/" + req.params.id);
    })
})


module.exports = router;