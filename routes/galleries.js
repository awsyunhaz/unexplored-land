var express = require("express"),
    router  = express.Router(),
    Gallery = require("../models/gallery"),
    middleware = require("../middleware"),
    NodeGeocoder = require('node-geocoder'),
    multer = require('multer');

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

    cloudinary.uploader.upload(req.file.path, function(result) {
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
router.get("/:galleryId", function(req, res){
    Gallery.findById(req.params.galleryId).populate("photos").exec(function(err, gallery){
        if (err){
            console.log(err);
        } else {
            console.log(gallery);
            res.render("galleries/show", {gallery: gallery});
        }
    })
})

// Edit Route
router.get("/:galleryId/edit", middleware.checkGalleryOwnership, function(req, res){
    Gallery.findById(req.params.galleryId, function(err, gallery){
        res.render("galleries/edit", {gallery: gallery});
    })
})

// Update Route
router.put("/:galleryId", middleware.checkGalleryOwnership, upload.single('cover-image'), function(req, res){
    var updatedGallery = req.body.gallery;

    cloudinary.uploader.upload(req.file.path, function(result) {
        updatedGallery.coverImage = result.secure_url;
        Gallery.findByIdAndUpdate(req.params.galleryId, updatedGallery, function(err, _){
            if (err){
                res.redirect("/galleries");
            } else {
                res.redirect("/galleries/" + req.params.galleryId)
            }
        });
    });
})

// Destroy Route
router.delete("/:galleryId", middleware.checkGalleryOwnership, function(req, res){
    Gallery.findByIdAndRemove(req.params.galleryId, function(err){
        if (err){
            res.redirect("/galleries");
        } else {
            res.redirect("/galleries");
        }
    })
})


module.exports = router;