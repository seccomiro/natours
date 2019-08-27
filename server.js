const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connected successfully.');
  });

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  const env = process.env.NODE_ENV || 'production';
  console.log(`[${env.toUpperCase()}] App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.error(err.name, '|', err.message);
  console.error('UNHANDLED REJECTION! SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});

// Better if settled on the top of the code
// Won't be called if the exception occurs inside an HTTP request
process.on('uncaughtException', err => {
  console.error(err.name, '|', err.message);
  console.error('UNCAUGHT EXCEPTION! SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});
