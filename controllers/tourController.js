const fs = require('fs');
const Tour = require('./../models/tourModel');

const toursFile = `${__dirname}/../dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(toursFile));

const saveTours = callback => {
  fs.writeFile(toursFile, JSON.stringify(tours), callback);
};

const findTour = (id, byIndex = false) => tours[`find${byIndex ? 'Index' : ''}`](tour => tour.id === parseInt(id, 10));

const invalidIdResponse = res =>
  res.status(404).json({
    status: 'fail',
    message: 'Invalid ID'
  });

exports.checkID = (req, res, next, id) => {
  const tour = findTour(id);
  if (!tour) return invalidIdResponse(res);
  req.tour = tour;
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours }
  });
};

exports.getTour = (req, res) => {
  const { tour } = req;
  res.status(200).json({
    status: 'success',
    results: 1,
    data: { tour }
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  saveTours(() => {
    res.status(201).json({
      status: 'success',
      data: { tour: newTour }
    });
  });
};

exports.updateTour = (req, res) => {
  const { tour } = req;
  Object.keys(tour).forEach(prop => {
    if (req.body[prop]) {
      tour[prop] = req.body[prop];
    }
  });

  saveTours(() => {
    res.status(201).json({
      status: 'success',
      data: { tour }
    });
  });
};

exports.deleteTour = (req, res) => {
  const { tour } = req;
  const i = findTour(tour.id, true);

  tours.splice(i, 1);

  saveTours(() => {
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
};
