const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      maxlength: [40, 'A user name must have a maximum of 40 characters'],
      minlength: [10, 'A user name must have a minimum of 10 characters']
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    image: String,
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: [6, 'The password must have a minimum of 6 characters'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'The password must be confirmed'],
      minlength: [6, 'The password confirmation must have a minimum of 6 characters'],
      select: false,
      validate: {
        validator: function(el) {
          return el === this.password;
        },
        message: "The password and its confirmation don't match"
      }
    },
    createdAt: { type: Date, default: Date.now(), select: false },
    passwordChangedAt: Date
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
