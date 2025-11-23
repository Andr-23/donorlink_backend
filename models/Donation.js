import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: { type: Number, required: true },
  bloodType: { type: String, required: true },
  date: { type: Date, default: Date.now },
  location: { type: String },
  message: { type: String },
});

const Donation = mongoose.model('Donation', DonationSchema);

export default Donation;
