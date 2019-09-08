var express = require("express"),
    router  = express.Router(),
    campground  = require("../models/campground"),
    Gallery  = require("../models/gallery"),
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
// Gallery ROUTES
// =============================
router.get("/", function(req, res){
    Gallery.find({}, function(err, allGalleries){
        if (err){
            console.log(err);
        } else {
            res.render("galleries/index", {galleries: allGalleries, page: "galleries"})
        };
    })
});

router.post("/", middleware.isLoggedIn, upload.single('cover-image'), function(req, res){
    console.log(req.body);
    var city = req.body.city;
    var continent = req.body.continent;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newGallery = {city: city, continent: continent, description: desc, author: author};

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
        // newCampground.location = req.body.location;
        // console.log(newCampground.lat);

        // add cloudinary url for the image to the campground object under image property
        newGallery.coverImage = result.secure_url;
        Gallery.create(newGallery, function(err, gallery) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/galleries/' + gallery.id);
        });
    });
});
// });

// New Route
router.get("/new", middleware.isLoggedIn,function(req, res){
    res.render("galleries/new")
})


// Show Route
router.get("/:id", function(req, res){
    Gallery.findById(req.params.id).populate("comments").exec(function(err, foundGallery){
        if (err){
            console.log(err);
        } else {
            console.log(foundGallery);
            res.render("galleries/show", {gallery: foundGallery});
        }
    })
})

// Edit Route
router.get("/:id/edit", middleware.checkGalleryOwnership, function(req, res){
    Gallery.findById(req.params.id, function(err, foundGallery){
        res.render("galleries/edit", {gallery: foundGallery});
    })
})

// Update Route
router.put("/:id", middleware.checkGalleryOwnership, upload.single('cover-image'), function(req, res){
    var updatedGallery = req.body.gallery;

    cloudinary.uploader.upload(req.file.path, function(result) {
        updatedGallery.coverImage = result.secure_url;
        Gallery.findByIdAndUpdate(req.params.id, updatedGallery, function(err, _){
            if (err){
                res.redirect("/galleries");
            } else {
                res.redirect("/galleries/" + req.params.id)
            }
        });
    });
})

// Destroy Route
router.delete("/:id", middleware.checkGalleryOwnership, function(req, res){
    Gallery.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/galleries");
        } else {
            res.redirect("/galleries");
        }
    })
})

// Add Photos to Gallery Route
router.post("/:id/add", middleware.isLoggedIn, upload.single('image'), function(req, res){
    Gallery.findById(req.params.id).populate("comments").exec(function(err, foundGallery){
        if (err){
            console.log(err);
        } else {
            console.log(foundGallery);
            cloudinary.uploader.upload(req.file.path, function(result) {
                foundGallery.images.push(result.secure_url);
                foundGallery.save();
                console.log(foundGallery.images);
                res.redirect('/galleries/' + foundGallery.id);
            });
        };
    });
});


module.exports = router;