const express       = require("express"),
      ejs           = require("ejs"),
      mongoose      = require("mongoose"),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      methodOverride = require("method-override"),
      flash         = require("connect-flash")

// Mongoose Models
const seedDB        = require("./seed"),
      User          = require("./models/user"),
      Campground    = require("./models/campground");

// Routes
const commentRoutes     = require("./routes/comments"),
      campgroundRoutes  = require("./routes/campgrounds"),
      indexRoutes       = require("./routes/index"),
      userRoutes        = require("./routes/user");

// Mongoose Config 
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
// mongodb://localhost/yelp_camp
mongoose.connect(process.env.MONGODB_URI);

// Express
app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs")
app.use(methodOverride('_method'));
app.use(express.static(__dirname + "/public"));
app.use(require("body-parser").urlencoded({extended: true}))
// Flash before redirect
app.use(flash())

app.locals.moment = require("moment");

// Passport Config
app.use(require("express-session")({
    secret: "Excuse me they're not roguelikes they're rogue-lites",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

// Personal Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.err = req.flash("error");
    res.locals.success = req.flash("success");
    next()
});

//index must be last to ensure "page not found" route is last
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:slug/comments", commentRoutes);
app.use("/", userRoutes);
app.use("/", indexRoutes); 

app.listen(port, () => {
    console.log("Server Has Started!");
});

if(process.env.UPDATE_DB) {
    Campground.find({}, (err, camps) => {
        if (err) return console.log(err);
        for(camp of camps) {
            camp.save();
        }
    })
}