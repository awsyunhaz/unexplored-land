var express = require("express"),
    router  = express.Router(),
    Campground  = require("../models/gallery"),
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
    Campground.find({}, function(err, allBlogs){
        if (err){
            console.log(err);
        } else {
            res.render("blogs/index", {blogs: allBlogs, page: "Blogs"})
        };
    })
});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, description: desc, author: author};

    console.log(req.body);
    // geocoder.geocode(req.body.location, function (err, data) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // if (err || !data.length) {
        //     req.flash("error", err.message);
        //     // req.flash('error', 'Invalid address');
        //     return res.redirect('back');
        // }
        // newCampground.lat = data[0].latitude;
        // newCampground.lng = data[0].longitude;
        // newCampground.location = data[0].formattedAddress;
        newCampground.location = req.body.location;
        // console.log(newCampground.lat);

        // add cloudinary url for the image to the campground object under image property
        newCampground.image = result.secure_url;
        Campground.create(newCampground, function(err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
        });
    });
});
// });

// New Route
router.get("/new", middleware.isLoggedIn,function(req, res){
    res.render("campgrounds/new")
})

// Show Route
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if (err){
            console.log(err);
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    })
})

// Edit Route
router.get("/:id/edit", middleware.checkBlogOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    })
})

// Update Route
router.put("/:id", middleware.checkBlogOwnership, upload.single('image'), function(req, res){
    var updatedCampground = req.body.campground;

    cloudinary.uploader.upload(req.file.path, function(result) {
        updatedCampground.image = result.secure_url;
        Campground.findByIdAndUpdate(req.params.id, updatedCampground, function(err, _){
            if (err){
                res.redirect("/campgrounds");
            } else {
                res.redirect("/campgrounds/" + req.params.id)
            }
        });
    });
})

// Destroy Route
router.delete("/:id", middleware.checkBlogOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    })
})

module.exports = router;