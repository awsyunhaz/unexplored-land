var express = require("express"),
    router  = express.Router(),
    Blog  = require("../models/blog"),
    continentMap = require("../public/continent"),
    middleware = require("../middleware"),
    NodeGeocoder = require('node-geocoder'),
    multer = require('multer');

// Google map API
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
var geocoder = NodeGeocoder(options);

// Image upload using cloudinary
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dj3opcxmz', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// =============================
// CAMPGROUNDS ROUTES
// =============================
router.get("/", function(req, res){
    Blog.find({}, function(err, allBlogs){
        if (err){
            console.log(err);
        } else {
            res.render("blogs/index", {blogs: allBlogs, page: "Blogs"});
        };
    })
});

router.post("/", middleware.isLoggedIn, upload.single('cover-image'), function(req, res){
    geocoder.geocode(req.body.blog.city, function (err, data) {
        if (err || !data.length) {
            req.flash("error", err.message);
            // req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var continent = continentMap[data[0].countryCode];
        cloudinary.uploader.upload(req.file.path, function(result) {
            // add cloudinary url for the image to the blog object under image property
            Blog.create(req.body.blog, function(err, blog) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
                console.log(result.secure_url);
                blog.coverImage = result.secure_url;
                blog.author.id = req.user._id;
                blog.author.username = req.user.username;
                blog.continent = continent;
                blog.save();
                res.redirect('/blogs/' + blog.id);
            });
        });
    });
});

// New Route
router.get("/new", middleware.isLoggedIn,function(req, res){
    res.render("blogs/new")
});

// Show Route
router.get("/:blogId", function(req, res){
    Blog.findById(req.params.blogId).populate("comments").exec(function(err, blog){
        if (err){
            console.log(err);
        } else {
            console.log(blog);
            res.render("blogs/show", {blog: blog});
        }
    })
});

// Edit Route
router.get("/:blogId/edit", middleware.checkBlogOwnership, function(req, res){
    Blog.findById(req.params.blogId, function(err, blog){
        res.render("blogs/edit", {blog: blog});
    })
});

// Update Route
router.put("/:blogId", middleware.checkBlogOwnership, upload.single('cover-image'), function(req, res){
    var updatedBlog = req.body.blog;

    cloudinary.uploader.upload(req.file.path, function(result) {
        updatedBlog.coverImage = result.secure_url;
        Blog.findByIdAndUpdate(req.params.blogId, updatedBlog, function(err, _){
            if (err){
                res.redirect("/blogs");
            } else {
                res.redirect("/blogs/" + req.params.blogId)
            }
        });
    });
});

// Destroy Route
router.delete("/:blogId", middleware.checkBlogOwnership, function(req, res){
    Blog.findByIdAndRemove(req.params.blogId, function(err){
        if (err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })
});

module.exports = router;
