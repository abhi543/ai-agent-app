import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">

        <div className="text-6xl mb-6">
          📧
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Check Your Email
        </h1>

        <p className="text-gray-600 leading-7 mb-8">
          We've sent a verification email to your inbox.
          <br /><br />
          Please click the verification link before logging in.
        </p>

        <a
          href="https://mail.google.com"
          target="_blank"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold mb-4"
        >
          Open Gmail
        </a>

        <Link
          href="/auth/login"
          className="block w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-100"
        >
          Back to Login
        </Link>

      </div>
    </div>
  );
}