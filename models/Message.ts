import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['inquiry', 'support', 'booking', 'general'],
    required: true
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },

  // Sender information
  sender: {
    userId: { type: String, required: true }, // Firebase UID
    name: { type: String, required: true },
    email: { type: String, required: true }
  },

  // Recipient information (usually partner or admin)
  recipient: {
    userId: { type: String, required: true }, // Firebase UID
    name: { type: String },
    email: { type: String }
  },

  // Related entities
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },

  // Message status and priority
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Response thread
  replies: [{
    message: { type: String, required: true },
    sender: { type: String, required: true }, // Name of replier
    senderId: { type: String }, // Firebase UID of replier
    createdAt: { type: Date, default: Date.now }
  }],

  // Metadata
  isAutomated: { type: Boolean, default: false }, // For system-generated messages
  category: { type: String }, // For categorization
  tags: [{ type: String }], // For filtering and search

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field before saving
MessageSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Indexes for efficient queries
MessageSchema.index({ 'sender.userId': 1 })
MessageSchema.index({ 'recipient.userId': 1 })
MessageSchema.index({ status: 1 })
MessageSchema.index({ priority: 1 })
MessageSchema.index({ type: 1 })
MessageSchema.index({ createdAt: -1 })

export default mongoose.models.Message || mongoose.model('Message', MessageSchema)