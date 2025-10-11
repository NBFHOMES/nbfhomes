import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable')

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: Promise<typeof mongoose> | undefined
}

async function connectDB(): Promise<void> {
  if (!global.__mongooseConn) {
    global.__mongooseConn = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  await global.__mongooseConn
}

export default connectDB
