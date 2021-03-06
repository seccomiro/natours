const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have a maximum of 40 characters'],
      minlength: [10, 'A tour name must have a minimum of 10 characters']
      // validate: {
      //   message: 'Name must have only letters',
      //   validator: validator.isAlpha
      // }
    },
    slug: String,
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: { type: Number, required: [true, 'A tour must have a group size'] },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be 1 or above'],
      max: [5, 'Rating must be 5 or less']
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // "this" only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) must be below regular price'
      }
    },
    summary: { type: String, trim: true },
    description: { type: String, trim: true, required: [true, 'A tour must have a description'] },
    imageCover: { type: String, required: [true, 'A tour must have a cover image'] },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secret: { type: Boolean, default: false }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Document Middleware (before) // "save" is ONLY for .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   // console.log('I can have a lot of these.');
//   next();
// });

// // Document Middleware (after)
// tourSchema.post('save', function(doc, next) {
//   // console.log(doc);
//   next();
// });

// Query Middleware
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  // "this" is a Query object
  this.find({ secret: { $ne: true } });
  // this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function(docs, next) {
//   const executionTime = Date.now() - this.start;
//   console.log(`Query took ${executionTime} milliseconds to run.`);
//   // console.log(docs);
//   next();
// });

// Aggreagation Middleware
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
