const mongoose = require('mongoose')

// Script to create a user record for Google sign-in
// Run with: node scripts/create-google-user.js <firebaseUID> <email> <displayName>

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

async function createGoogleUser(firebaseUID, email, displayName, photoURL = '') {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking'
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ uid: firebaseUID }, { email: email }] })
    if (existingUser) {
      console.log('User already exists:', existingUser.email)
      console.log('Current role:', existingUser.role)
      console.log('Current status:', existingUser.status)

      // Update to admin if not already
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin'
        existingUser.status = 'active'
        existingUser.updatedAt = new Date()
        await existingUser.save()
        console.log('✅ User promoted to admin!')
      }

      return
    }

    // Create new admin user
    const newUser = new User({
      uid: firebaseUID,
      displayName: displayName,
      email: email,
      photoURL: photoURL,
      role: 'admin',
      status: 'active'
    })

    await newUser.save()

    console.log('✅ Google user created and promoted to admin successfully!')
    console.log(`Email: ${email}`)
    console.log(`Display Name: ${displayName}`)
    console.log(`Firebase UID: ${firebaseUID}`)
    console.log(`Role: admin`)
    console.log(`Status: active`)

  } catch (error) {
    console.error('Error creating Google user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Get arguments from command line
const [,, firebaseUID, email, displayName, photoURL] = process.argv

if (!firebaseUID || !email || !displayName) {
  console.log('Usage: node scripts/create-google-user.js <firebaseUID> <email> <displayName> [photoURL]')
  console.log('Example: node scripts/create-google-user.js "abc123def456" "user@example.com" "John Doe"')
  process.exit(1)
}

createGoogleUser(firebaseUID, email, displayName, photoURL || '')