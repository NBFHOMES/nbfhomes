import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String },
  role: {
    type: String,
    enum: ['guest', 'partner', 'admin'],
    default: 'guest'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  phoneNumber: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String }
  },
  // For partners
  businessInfo: {
    companyName: { type: String },
    taxId: { type: String },
    businessLicense: { type: String }
  },
  // Public contact details exposed to guests for enquiries
  publicContact: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    visible: { type: Boolean, default: true }
  },
  publicContactCompleted: { type: Boolean, default: false },
  // Analytics data
  bookingsCount: { type: Number, default: 0 },
  propertiesCount: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Add indexes for performance (uid and email are already indexed by unique: true)
UserSchema.index({ role: 1, status: 1 }) // Admin filtering
UserSchema.index({ createdAt: -1 }) // Recent users sorting

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.User || mongoose.model('User', UserSchema)