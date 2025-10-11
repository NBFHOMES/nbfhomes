import mongoose from 'mongoose'

const PartnerApplicationSchema = new mongoose.Schema({
  userId: { type: String },
  // Applicant Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },

  // Document URLs (stored in ImageKit)
  documents: {
    selfie: { type: String, required: true },
    aadharFront: { type: String, required: true },
    aadharBack: { type: String, required: true }
  },

  // Agreements
  agreements: {
    terms: { type: Boolean, required: true },
    privacy: { type: Boolean, required: true },
    verification: { type: Boolean, required: true }
  },

  // Application Status
  status: {
    type: String,
    enum: ['pending_review', 'under_review', 'approved', 'rejected', 'on_hold'],
    default: 'pending_review'
  },

  // Review Information
  reviewedBy: { type: String }, // Firebase UID of admin who reviewed
  reviewedAt: { type: Date },
  reviewNotes: { type: String },

  // Business Information (to be filled after approval)
  businessInfo: {
    companyName: { type: String },
    taxId: { type: String },
    businessLicense: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String }
    }
  },

  // Timestamps
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field before saving
PartnerApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Index for efficient queries
PartnerApplicationSchema.index({ status: 1 })
PartnerApplicationSchema.index({ email: 1 })
PartnerApplicationSchema.index({ submittedAt: -1 })

export default mongoose.models.PartnerApplication || mongoose.model('PartnerApplication', PartnerApplicationSchema)