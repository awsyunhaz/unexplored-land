var Gallery = require("../models/gallery"),
    Photo = require("../models/photo"),
    Blog = require("../models/blog"),
    Comment = require("../models/comment"),
    middlewareObj = {}; 

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if (req.isAuthenticated()){
        Blog.findById(req.params.id, function(err, foundBlog){
            if (err){
                req.flash.error("error", "Blog Not Found!")
                res.redirect("back");
            } else {
                console.log(foundBlog);
                if (foundGallery.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.redirect("error", "Permission Denied!")
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "Please Login first!");
        res.redirect("back");
    }
}

middlewareObj.checkGalleryOwnership = function(req, res, next){
    if (req.isAuthenticated()){
        Gallery.findById(req.params.galleryId, function(err, foundGallery){
            if (err){
                req.flash.error("error", "Gallery Not Found!")
                res.redirect("back");
            } else {
                console.log(foundGallery);
                if (foundGallery.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.redirect("error", "Permission Denied!")
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "Please Login first!");
        res.redirect("back");
    }
}

middlewareObj.checkPhotoOwnership = function(req, res, next){
    if (req.isAuthenticated()){
        Photo.findById(req.params.photoId, function(err, foundPhoto){
            if (err){
                req.flash.error("error", "Photo Not Found!")
                res.redirect("back");
            } else {
                console.log(foundPhoto);
                if (foundPhoto.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.redirect("error", "Permission Denied!")
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "Please Login first!");
        res.redirect("back");
    }
}

middlewareObj.checkBlogOwnership = function(req, res, next){
    if (req.isAuthenticated()){
        Blog.findById(req.params.blogId, function(err, foundBlog){
            if (err){
                req.flash.error("error", "Blog Not Found!")
                res.redirect("back");
            } else {
                console.log(foundBlog);
                if (foundBlog.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.redirect("error", "Permission Denied!")
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
        Comment.findById(req.params.commentId, function(err, foundComment){
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