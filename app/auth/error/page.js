export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-neutral-100 px-6 text-center">
      <h1 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
        Sign-in did not complete
      </h1>
      <p className="text-neutral-500 mb-8 max-w-md">
        Something went wrong during Google sign-in. Check the terminal for the exact error.
      </p>
      <a href="/login" className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-100 text-sm">
        Try again
      </a>
    </div>
  );
}
