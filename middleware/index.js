var Gallery = require("../models/gallery"),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middlewareObj = {}; 

middlewareObj.checkGalleryOwnership = function(req, res, next){
    if (req.isAuthenticated()){
        Gallery.findById(req.params.id, function(err, foundGallery){
            if (err){
                req.flash.error("error", "Campground Not Found!")
                res.redirect("back");
            } else {
                console.log(foundGallery);
                if (foundGallery.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.redirect("error", "Permision Denied!")
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "Please Login first!");
        res.redirect("back");
    }
}
middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if (req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if (err){
                req.flash.error("error", "Campground Not Found!")
                res.redirect("back");
            } else {
                console.log(foundCampground);
                if (foundCampground.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.redirect("error", "Permision Denied!")
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "Please Login first!");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    if (req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if (err){

                res.redirect("back")
            } else {
                console.log(foundComment);
                if (foundComment.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.flash("Permission Denied!")
                    res.redirect("back");
                }
            }
        })
    } else {
        res.flash("error", "Please Login First!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function (req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/login");
}

module.exports = middlewareObj;