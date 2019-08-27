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
app.listen(port, () => {
  const env = process.env.NODE_ENV || 'production';
  console.log(`[${env.toUpperCase()}] App running on port ${port}...`);
});
