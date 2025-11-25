import mongoose from 'mongoose';

const BloodCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    currentDonorCount: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: true }
);

const BloodCenter = mongoose.model('BloodCenter', BloodCenterSchema);

export default BloodCenter;
