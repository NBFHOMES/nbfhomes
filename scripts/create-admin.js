const mongoose = require('mongoose')

// Simple script to create an admin user
// Run with: node scripts/create-admin.js

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

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking'
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email)
      return
    }

    // Create admin user
    const adminUser = new User({
      uid: 'admin-' + Date.now(), // Generate a unique Firebase-like UID
      displayName: 'Admin User',
      email: 'admin@stayhub.com',
      role: 'admin',
      status: 'active',
      phoneNumber: '+1-555-ADMIN',
      address: {
        city: 'Admin City',
        country: 'Admin Country'
      }
    })

    await adminUser.save()
    console.log('Admin user created successfully!')
    console.log('Email: admin@stayhub.com')
    console.log('Password: You will need to register this email in Firebase Auth')
    console.log('Role: admin')
    console.log('Status: active')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createAdmin()