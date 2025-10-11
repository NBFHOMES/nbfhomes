import mongoose from 'mongoose'

const BookingSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  roomType: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  guestDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Add indexes for performance
BookingSchema.index({ userId: 1, createdAt: -1 }) // User bookings
BookingSchema.index({ hotelId: 1, checkIn: 1 }) // Hotel availability
BookingSchema.index({ status: 1, createdAt: -1 }) // Status filtering
BookingSchema.index({ paymentStatus: 1 }) // Payment status
BookingSchema.index({ createdAt: -1 }) // Recent bookings

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema)
