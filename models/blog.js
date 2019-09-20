var mongoose = require("mongoose");

// Schema setup
var blogSchema = new mongoose.Schema({
    title: String,
    city: String,
    continent: String,
    coverImage: String,
    content: String,
    created_at: {type: Date, default: Date.now},
    lat: Number,
    lng: Number,
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
});
var Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;