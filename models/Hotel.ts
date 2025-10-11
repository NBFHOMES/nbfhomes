import mongoose from 'mongoose'

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String }
  }],
  amenities: [{ type: String }],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  pricePerNight: { type: Number, required: true },
  rooms: [{
    type: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Number, default: 0 }
  }],
  ownerId: { type: String, required: true }, // Firebase UID
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: { type: Boolean, default: false }, // Only approved properties are active
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Add indexes for performance
HotelSchema.index({ 'location.city': 1 }) // City search
HotelSchema.index({ pricePerNight: 1 }) // Price filtering
HotelSchema.index({ isActive: 1, status: 1 }) // Active properties
HotelSchema.index({ ownerId: 1 }) // Partner properties
HotelSchema.index({ rating: -1 }) // Rating sorting
HotelSchema.index({ createdAt: -1 }) // Recent properties

export default mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema)
