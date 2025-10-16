import mongoose from 'mongoose'

const SecurityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['login', 'logout', 'failed_login', 'password_change', 'profile_update', 'suspicious_activity', 'unauthorized_access'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  userId: { type: String }, // Firebase UID
  userEmail: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  location: {
    country: { type: String },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional event data
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
})

// Index for efficient queries
SecurityEventSchema.index({ type: 1, severity: 1 })
SecurityEventSchema.index({ userId: 1 })
SecurityEventSchema.index({ createdAt: -1 })
SecurityEventSchema.index({ ipAddress: 1 })

export default mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', SecurityEventSchema)