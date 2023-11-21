const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground.js')
const Review = require('../models/review.js')
const ExpressError = require('../utils/ExpressError.js')
const {reviewSchema} = require('../schemas.js')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js')
const reviews = require('../controllers/review.js')




//review routes
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview ))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview ))

module.exports = router;