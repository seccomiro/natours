const path = require('path');
const express = require('express');
const morgan = require('morgan');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Diego'
  });
});

const defaultRoute = '/api/v1';
app.use(`${defaultRoute}/tours`, tourRouter);
app.use(`${defaultRoute}/users`, userRouter);

app.all('*', (req, res) => {
  res.status(404).json({
    statue: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

module.exports = app;
