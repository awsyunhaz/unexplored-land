var mongoose = require("mongoose");

// Schema setup
var PhotoSchema = new mongoose.Schema({
    name: String,
    link: String,
    desc: String,
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
var Photo = mongoose.model("Photo", PhotoSchema);

module.exports = Photo