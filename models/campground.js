const mongoose = require("mongoose");

Comment = require("../models/comment");

var campgroundSchema = new mongoose.Schema({
    name: String,
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

// findByIdAndDelete calls findOneAndDelete with _id: id
// https://mongoosejs.com/docs/middleware.html#types-of-middleware
campgroundSchema.pre('findOneAndDelete', async (next) => {
    // Explicity get document via query
    let camp = await this.model.findOne(this.getQuery());

	await Comment.deleteMany({
		_id: {
			$in: camp.comments
		}
    });
    next();
});

module.exports = mongoose.model("Campground", campgroundSchema);