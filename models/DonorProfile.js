import mongoose from 'mongoose';

const DonorProfileSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dateOfBirth: { type: Date, required: true },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active',
    },
    medicalHistory: { type: String },
    donations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],
    donationCount: { type: Number, default: 0 },
    lastDonationDate: { type: Date },
    address: { type: String, required: true },
  },
  { versionKey: false, timestamps: true }
);

const DonorProfile = mongoose.model('DonorProfile', DonorProfileSchema);

export default DonorProfile;
