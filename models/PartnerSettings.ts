import mongoose from 'mongoose'

const PartnerSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Firebase UID

  // Profile settings
  profile: {
    displayName: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    businessName: { type: String },
    businessAddress: { type: String },
    taxId: { type: String }
  },

  // Notification preferences
  notifications: {
    emailBookings: { type: Boolean, default: true },
    emailReviews: { type: Boolean, default: true },
    emailMessages: { type: Boolean, default: true },
    emailMarketing: { type: Boolean, default: false },
    pushBookings: { type: Boolean, default: true },
    pushReviews: { type: Boolean, default: true }
  },

  // Security settings
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 } // minutes
  },

  // Payment settings
  payment: {
    payoutMethod: {
      type: String,
      enum: ['bank', 'paypal', 'stripe'],
      default: 'bank'
    },
    payoutSchedule: {
      type: String,
      enum: ['weekly', 'monthly', 'manual'],
      default: 'monthly'
    },
    bankDetails: {
      accountNumber: { type: String },
      routingNumber: { type: String },
      accountName: { type: String }
    }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field before saving
PartnerSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.PartnerSettings || mongoose.model('PartnerSettings', PartnerSettingsSchema)