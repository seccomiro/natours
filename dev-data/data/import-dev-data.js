const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');

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

    const importData = async (model, simple = false) => {
      const type = simple ? '-simple' : '';
      const collection = `${model.modelName.toLowerCase()}s`;
      console.log(`Importing all ${collection}...`);
      const documents = JSON.parse(fs.readFileSync(`${__dirname}/${collection}${type}.json`, 'utf-8'));
      if (model === User) {
        documents.forEach(u => {
          u.passwordConfirm = u.password;
        });
      }

      try {
        await model.create(documents);
        console.log('Data successfully loaded.');
      } catch (error) {
        console.log(error);
      }
      process.exit();
    };

    const deleteData = async model => {
      try {
        console.log(`Deleting all ${model.modelName.toLowerCase()}s...`);
        await model.deleteMany();
        console.log('Data successfully deleted.');
      } catch (error) {
        console.log(error);
      }
      process.exit();
    };

    const option = process.argv[2];
    if (option === '--import') {
      importData(Tour, false);
      importData(User);
    } else if (option === '--delete') {
      deleteData(Tour);
      deleteData(User);
    } else {
      console.error('Invalid option.');
      process.exit();
    }
  });
