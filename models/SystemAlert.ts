import mongoose from 'mongoose'

const SystemAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['system', 'security', 'performance', 'business', 'user'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  source: { type: String, required: true },
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: String }, // Admin UID who acknowledged
  acknowledgedAt: { type: Date },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: String }, // Admin UID who resolved
  resolvedAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field before saving
SystemAlertSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Index for efficient queries
SystemAlertSchema.index({ type: 1, severity: 1 })
SystemAlertSchema.index({ acknowledged: 1, resolved: 1 })
SystemAlertSchema.index({ createdAt: -1 })

export default mongoose.models.SystemAlert || mongoose.model('SystemAlert', SystemAlertSchema)