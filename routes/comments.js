var express = require("express"),
    router  = express.Router({mergeParams: true}),
    Photo = require("../models/photo"),
    Comment = require("../models/comment"),
    middleware = require("../middleware");

function getDateTime(){
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return dateTime = date + ' ' + time;
}

// =============================
// COMMENTS ROUTES
// =============================
router.post("/", middleware.isLoggedIn, function(req, res){
    console.log("here");
    Photo.findById(req.params.photoId, function(err, photo){
        if (err){
            console.log(err);
        } else {
            var newComment = {text: req.body.comment, datetime: getDateTime()}
            Comment.create(newComment, function(err, comment){
                if (err){
                    req.flash("error", "Something went wrong!")
                    console.log(err);
                } else {
                    // associate author to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    photo.comments.push(comment);
                    photo.save();
                    req.flash("success", "Successfully Added!")
                    res.redirect("/galleries/" + req.params.galleryId + "/photos/" + photo._id);
                }
            })
        }
    })
})

// Edit Route
// router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
//     Comment.findById(req.params.comment_id, function(err, foundComment){
//         if (err){
//             res.redirect("back");
//         } else {
//             res.render("comments/edit", {campground_id: req.params.id, comment: foundComment})
//         }
//     })
// })

// Update Route
// router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
//     Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
//         if (err){
//             res.redirect("back");
//         } else {
//             res.redirect("/campgrounds/" + req.params.id);
//         }
//     })
// })

// Destroy Route
router.delete("/:commentId", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.commentId, function(err){
        if (err){
            res.redirect("back");
        } else {
            req.flash("success", "Successfully Deleted!")
            res.redirect("/galleries/" + req.params.galleryId + "/photos/" + req.params.photoId);
        }
    })
})

module.exports = router;