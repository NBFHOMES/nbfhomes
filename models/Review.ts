import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  images: [{ type: String }], // URLs to review images
  isVerified: { type: Boolean, default: false }, // Verified booking review
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  helpful: { type: Number, default: 0 }, // Number of helpful votes
  reported: { type: Boolean, default: false },
  reportReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field before saving
ReviewSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Index for efficient queries
ReviewSchema.index({ hotelId: 1, status: 1 })
ReviewSchema.index({ userId: 1 })

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema)