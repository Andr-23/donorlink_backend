import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'This email is already taken'],
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [5, 'Password must be at least 5 characters long'],
    },
    roles: {
      type: [String],
      enum: ['user', 'admin'],
      default: ['user'],
    },
  },
  { versionKey: false, timestamps: true }
);

UserSchema.methods.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = model('User', UserSchema);

export default User;
