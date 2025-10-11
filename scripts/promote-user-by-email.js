const mongoose = require('mongoose')

// Script to promote a user to admin by email
// Run with: node scripts/promote-user-by-email.js <email>

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

async function promoteUserByEmail(email) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking'
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Find user by email
    const user = await User.findOne({ email: email })

    if (!user) {
      console.log(`User with email ${email} not found. Creating new admin user...`)

      // Create new admin user (this won't work for Google sign-in without Firebase UID)
      // For Google sign-in users, we need to get their Firebase UID first
      console.log('For Google sign-in users, please provide the Firebase UID.')
      console.log('You can find the UID in Firebase Console or browser dev tools.')
      return
    }

    // Update user to admin
    user.role = 'admin'
    user.status = 'active'
    user.updatedAt = new Date()

    await user.save()

    console.log(`✅ User ${email} promoted to admin successfully!`)
    console.log(`Role: ${user.role}`)
    console.log(`Status: ${user.status}`)
    console.log(`Firebase UID: ${user.uid}`)

  } catch (error) {
    console.error('Error promoting user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Get email from command line argument
const email = process.argv[2]
if (!email) {
  console.log('Usage: node scripts/promote-user-by-email.js <email>')
  process.exit(1)
}

promoteUserByEmail(email)