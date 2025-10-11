const mongoose = require('mongoose')

// Script to promote a user to partner by Firebase UID
// Run with: node scripts/promote-by-uid.js <uid>

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
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
  businessInfo: {
    companyName: { type: String },
    taxId: { type: String },
    businessLicense: { type: String }
  },
  bookingsCount: { type: Number, default: 0 },
  propertiesCount: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function promoteUserByUid(uid) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking'
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Find user by UID
    const user = await User.findOne({ uid: uid })

    if (!user) {
      console.log(`User with UID ${uid} not found.`)
      return
    }

    console.log(`Found user: ${user.email} (${user.displayName})`)
    console.log(`Current role: ${user.role}`)

    // Update user to partner
    user.role = 'partner'
    user.status = 'active'
    user.updatedAt = new Date()

    await user.save()

    console.log(`✅ User ${user.email} promoted to partner successfully!`)
    console.log(`New role: ${user.role}`)
    console.log(`Status: ${user.status}`)

  } catch (error) {
    console.error('Error promoting user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Get UID from command line argument
const uid = process.argv[2]
if (!uid) {
  console.log('Usage: node scripts/promote-by-uid.js <firebase-uid>')
  process.exit(1)
}

promoteUserByUid(uid)