import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="mb-6">There was a problem signing you in. The verification code may have expired.</p>
      <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Return to Login
      </Link>
    </div>
  )
}
