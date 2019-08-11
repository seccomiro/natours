const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

const invalidResponse = (res, err, code = 404) =>
  res.status(code).json({
    status: 'fail',
    message: err
  });

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

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();
    const tours = await features.query;

    resultResponse(res, tours);
  } catch (error) {
    invalidResponse(res, error.message);
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    okResponse(res, { tour });
  } catch (error) {
    invalidResponse(res, error);
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    okResponse(res, { tour: newTour }, 201);
  } catch (err) {
    invalidResponse(res, err, 400);
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    okResponse(res, { tour });
  } catch (error) {
    invalidResponse(res, error, 400);
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) throw new Error('Invalid tour ID');
    okResponse(res, null, 204);
  } catch (error) {
    invalidResponse(res, error.message, 400);
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    invalidResponse(res, error.message, 400);
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    invalidResponse(res, error.message, 400);
  }
};
