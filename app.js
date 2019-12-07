require('dotenv').config();
var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");

var indexRoutes = require("./routes/index"),
    galleryRoutes = require("./routes/galleries"),
    photoRoutes = require("./routes/photos"),
    blogRoutes = require("./routes/blogs"),
    commentRoutes = require("./routes/comments");

// mongoose.connect("mongodb://localhost/yelp_camp", {useNewUrlParser: true});
var url = process.env.DATABASE_URL || "mongodb://localhost/unexplored_land";
mongoose.connect(url, {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "unexploredland",
    resave: false,
    saveUninitialize: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

app.use("/", indexRoutes);
app.use("/galleries", galleryRoutes);
app.use("/galleries/:galleryId/photos", photoRoutes);
app.use("/galleries/:galleryId/photos/:photoId/comments", commentRoutes);
app.use("/blogs", blogRoutes);


var port = process.env.PORT || 3000;
// console.log(process.env.IP)
// console.log(port)
app.listen(port, process.env.IP, function(){
    console.log("Server has started on " + process.env.IP, + ' : ' + process.env.PORT);
});
