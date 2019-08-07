const Tour = require('./../models/tourModel');

const invalidIdResponse = res =>
  res.status(404).json({
    status: 'fail',
    message: 'Invalid ID'
  });

exports.getAllTours = (req, res) => {
  // res.status(200).json({
  //   status: 'success',
  //   requestedAt: req.requestTime,
  //   results: tours.length,
  //   data: { tours }
  // });
};

exports.getTour = (req, res) => {
  const { tour } = req;
  res.status(200).json({
    status: 'success',
    results: 1,
    data: { tour }
  });
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data set'
    });
  }
};

exports.updateTour = (req, res) => {
  const { tour } = req;
  Object.keys(tour).forEach(prop => {
    if (req.body[prop]) {
      tour[prop] = req.body[prop];
    }
  });

  // saveTours(() => {
  //   res.status(201).json({
  //     status: 'success',
  //     data: { tour }
  //   });
  // });
};

exports.deleteTour = (req, res) => {
  // const { tour } = req;
  // const i = findTour(tour.id, true);
  // // tours.splice(i, 1);
  // saveTours(() => {
  //   res.status(204).json({
  //     status: 'success',
  //     data: null
  //   });
  // });
};
