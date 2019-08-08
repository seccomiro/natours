const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');

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

    const importData = async () => {
      console.log('Importing all data...');
      const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
      try {
        await Tour.create(tours);
        console.log('Data successfully loaded.');
      } catch (error) {
        console.log(error);
      }
      process.exit();
    };

    const deleteData = async () => {
      try {
        console.log('Deleting all data...');
        await Tour.deleteMany();
        console.log('Data successfully deleted.');
      } catch (error) {
        console.log(error);
      }
      process.exit();
    };

    const option = process.argv[2];
    if (option === '--import') importData();
    else if (option === '--delete') deleteData();
    else {
      console.error('Invalid option.');
      process.exit();
    }
  });
