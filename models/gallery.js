var mongoose = require("mongoose");

// Schema setup
var gallerySchema = new mongoose.Schema({
    city: String,
    continent: String,
    coverImage: String,
    images: [],
    description: String,
    location: String,
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
var Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = Gallery;