import mongoose from 'mongoose'

const SupportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  userId: { type: String, required: true }, // Firebase UID
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['booking', 'payment', 'account', 'hotel', 'technical', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: { type: String }, // Admin UID who is handling the ticket
  tags: [{ type: String }],
  attachments: [{
    filename: { type: String },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  messages: [{
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderType: { type: String, enum: ['user', 'admin'], required: true },
    message: { type: String, required: true },
    attachments: [{
      filename: { type: String },
      url: { type: String }
    }],
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  resolution: {
    resolvedBy: { type: String },
    resolution: { type: String },
    resolvedAt: { type: Date }
  },
  metadata: {
    userAgent: { type: String },
    ipAddress: { type: String },
    bookingId: { type: String },
    hotelId: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
})

// Update the updatedAt field before saving
SupportTicketSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  this.lastActivity = new Date()
  next()
})

// Index for efficient queries (ticketId is already indexed by unique: true)
SupportTicketSchema.index({ userId: 1, status: 1 })
SupportTicketSchema.index({ status: 1, priority: 1 })
SupportTicketSchema.index({ assignedTo: 1 })

export default mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema)