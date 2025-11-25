import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'canceled'],
      default: 'requested',
    },
    requestedAt: { type: Date, default: Date.now },
    scheduledFor: { type: Date },
    completedAt: { type: Date },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodCenter' },
    notes: { type: String },
  },
  { versionKey: false, timestamps: true }
);

const Donation = mongoose.model('Donation', DonationSchema);

export default Donation;
