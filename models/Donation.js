import mongoose from 'mongoose';
import { DONATION_STATUS } from '../constants.js';

const DonationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: DONATION_STATUS,
      default: 'requested',
    },
    scheduledFor: { type: Date },
    completedAt: { type: Date },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodCenter' },
    notes: { type: String, maxlength: 1000 },
  },
  { versionKey: false, timestamps: true }
);

DonationSchema.pre('save', function (next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

const Donation = mongoose.model('Donation', DonationSchema);

export default Donation;
