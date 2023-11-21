if (process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}



//varibles

const express = require('express');
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const db = mongoose.connection;
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const MongoStore = require('connect-mongo');




const campgroundRoutes = require('./routes/campground.js');
const reviewRoutes = require('./routes/reviews.js');
const usersRoutes = require('./routes/user.js')


// const dbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'
//Database connections
mongoose.connect(dbUrl)
// mongoose.connect(dbUrl)
.then(() => {
    console.log("db connected")
})
.catch(err => {
    console.log("Oh No Error")
    console.log(err)
})



//middleware
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public' )))
app.use(mongoSanitize())
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwcbi82ts/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

store.on('error', function (e) {
    console.log("session store error")
})

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})





app.use('/', usersRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


//routes
app.get('/', (req, res) => {
    res.render('home.ejs')
})








//Error handling routes
app.all('*', (req, res, next) =>{
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = 'Oh No, Something Went Wrong'
    res.status(statusCode).render('error', {err});
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})