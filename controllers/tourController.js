const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// const invalidResponse = (res, err, code = 404) =>
//   res.status(code).json({
//     status: 'fail',
//     message: err
//   });

const okResponse = (res, data = null, code = 200) =>
  res.status(code).json({
    status: 'success',
    data
  });

const resultResponse = (res, data = null, code = 200) =>
  res.status(code).json({
    status: 'success',
    results: data.length,
    data
  });

exports.aliasTopTours = (req, res, next) => {
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  req.query.sort = 'price,ratingsAverage';
  req.query.limit = 3;
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // try {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fields()
    .paginate();
  const tours = await features.query;

  resultResponse(res, tours);
  // } catch (error) {
  //   invalidResponse(res, error.message);
  // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  okResponse(res, { tour });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  okResponse(res, { tour: newTour }, 201);
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  okResponse(res, { tour });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  okResponse(res, null, 204);
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id: 'null',
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    },
    {
      $match: { _id: { $ne: 'EASY' } }
    }
  ]);
  resultResponse(res, stats);
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        count: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 12
    }
  ]);

  resultResponse(res, plan);
});
