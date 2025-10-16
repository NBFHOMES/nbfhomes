import mongoose from 'mongoose'

const SystemSettingsSchema = new mongoose.Schema({
  // General settings
  general: {
    siteName: { type: String, default: 'NBFHOMES' },
    siteDescription: { type: String, default: 'Modern hotel booking platform' },
    contactEmail: { type: String, default: 'support@nbfhomes.com' },
    supportPhone: { type: String, default: '+1-555-0123' },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' }
  },

  // Security settings
  security: {
    enableTwoFactor: { type: Boolean, default: false },
    passwordMinLength: { type: Number, default: 8 },
    sessionTimeout: { type: Number, default: 3600 }, // seconds
    maxLoginAttempts: { type: Number, default: 5 },
    enableCaptcha: { type: Boolean, default: true },
    ipWhitelist: [{ type: String }]
  },

  // Email settings
  email: {
    smtpHost: { type: String, default: 'smtp.gmail.com' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String },
    smtpPassword: { type: String },
    fromEmail: { type: String, default: 'noreply@nbfhomes.com' },
    fromName: { type: String, default: 'NBFHOMES' }
  },

  // Payment settings
  payments: {
    stripePublishableKey: { type: String },
    stripeSecretKey: { type: String },
    paypalClientId: { type: String },
    paypalClientSecret: { type: String },
    platformFee: { type: Number, default: 0.05 }, // 5%
    currency: { type: String, default: 'USD' }
  },

  // Notification settings
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    bookingConfirmations: { type: Boolean, default: true },
    paymentReminders: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true }
  },

  // Maintenance settings
  maintenance: {
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'Site is under maintenance. Please check back later.' },
    allowedIPs: [{ type: String }]
  },

  updatedBy: { type: String }, // Firebase UID of admin who last updated
  updatedAt: { type: Date, default: Date.now }
})

// Ensure only one settings document exists
SystemSettingsSchema.pre('save', async function(next) {
  const count = await mongoose.models.SystemSettings?.countDocuments() || 0
  if (count > 0 && this.isNew) {
    const error = new Error('Only one system settings document is allowed')
    return next(error)
  }
  next()
})

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema)