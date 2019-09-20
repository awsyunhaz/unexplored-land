var express = require("express"),
    router  = express.Router({mergeParams: true}),
    Gallery  = require("../models/gallery"),
    Photo  = require("../models/photo"),
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
console.log(process.env.GEOCODER_API_KEY);
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
// Photo ROUTES
// =============================

// Show Route
router.get("/:photoId", function(req, res){
  Photo.findById(req.params.photoId).populate("comments").exec(function(err, foundPhoto){
    if (err){
      console.log(err);
    } else {
      console.log(foundPhoto);
      res.render("photos/show", {photo: foundPhoto, gallery_id: req.params.galleryId});
    }
  })
})

// Add Route
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
  Gallery.findById(req.params.galleryId).populate("comments").exec(function(err, gallery){
    if (err){
        console.log(err);
    } else {
      console.log(req.body.photo);
      var name = req.body.name,
          desc = req.body.desc,
          author = {
            id: req.user._id,
            username: req.user.username
          };
      // Use Google geocoding API to get latitude and longtitude on map
      geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash("error", err.message);
          // req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude, 
            lng = data[0].longitude,
            loc = data[0].formattedAddress;

        // add cloudinary url for the image to the campground object under image property
        cloudinary.uploader.upload(req.file.path, function(result) {
          var link = result.secure_url;
          var photo = {name: name, desc: desc, author: author, lat: lat, lng: lng, location: loc, link: link};
          Photo.create(photo, function(err, newPhoto){
            gallery.photos.push(newPhoto);
            gallery.save();
            req.flash("success", "Successfully Added!")
            res.redirect("/galleries/" + gallery._id);
          })
        });
      })
    };
  });
});


// Update Route
router.put("/:photoId", middleware.checkPhotoOwnership, upload.single('image'), function(req, res){
  var updatedPhoto = req.body.photo;

  cloudinary.uploader.upload(req.file.path, function(result) {
    updatedPhoto.link = result.secure_url;
    Photo.findByIdAndUpdate(req.params.photoId, updatedPhoto, function(err, _){
      if (err){
        req.flash('error', err.message);
      } else {
        res.redirect("/galleries/" + req.params.galleryId + "/photos/" + req.params.photoId);
      }
    });
  });
})

// Destroy Route
router.delete("/:photoId", middleware.checkPhotoOwnership, function(req, res){
  console.log(req.params);
  Photo.findByIdAndRemove(req.params.photoId, function(err){
    if (err){
      res.redirect("back");
    } else {
      res.redirect("/galleries/" + req.params.galleryId);
    }
  })
})

module.exports = router;