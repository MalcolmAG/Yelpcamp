const mongoose = require("mongoose");

const Comment       = require("../models/comment");

var campgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: "Campground name cannot be blank."
    },
    slug: {
        type: String,
        unique: true
    },
    image: String,
    description: String,
    cost: Number,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
})

// save hook to update slug
campgroundSchema.pre("save", async function(next) {
    try{
        // check if camp is new or updated
        if (this.isNew || this.isModified("name")) {
            this.slug = await generateUniqueSlug(this.id, this.name);
        }
        next()
    }
    catch (err) {
        next(err);
    }
})

// findByIdAndDelete calls findOneAndDelete with _id: id
// https://mongoosejs.com/docs/middleware.html#types-of-middleware
campgroundSchema.pre('findOneAndDelete', async function (next) {
    try{
        // Explicity get document via query
        let camp = await this.model.findOne(this.getQuery());
        await Comment.deleteMany({
            _id: {
                $in: camp.comments
            }
        });
    }
    catch (err) {
        next(err);
    }

});

var Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;

// MUST BE BELOW Model Definition
// Generates unique slug 
async function generateUniqueSlug(id, campgroundName, slug) {
    try {
        // slug doesn't yet exist, create new one
        if (!slug) {
            slug = slugify(campgroundName);
        }
        // check if slug is actually unique
        var campground = await Campground.findOne({slug: slug});
        // if campground is found or found campground is current one
        if (!campground || campground.id.equals(id)){
            return slug;
        }
        // not unique, generate new slug
        var newSlug = slugify(campgroundName);
        return await generateUniqueSlug(slugify);
    } catch (err) {
        throw new Error(err);
    }
}

function slugify(text) {
    var slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '')          // Trim - from end of text
        .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
}
