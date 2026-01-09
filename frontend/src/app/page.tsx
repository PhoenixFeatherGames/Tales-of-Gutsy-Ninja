
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 font-sans">
      <main className="flex flex-col items-center justify-center w-full max-w-md p-8 bg-white/90 dark:bg-zinc-900/90 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-4 text-center text-black dark:text-zinc-50 drop-shadow-lg">Naruto RPG</h1>
        <p className="mb-8 text-lg text-zinc-700 dark:text-zinc-300 text-center max-w-xs">Begin your shinobi journey. Sign in or create an account to enter the world.</p>
        <div className="flex flex-col gap-4 w-full">
          <Link href="/auth/login" className="w-full">
            <button className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold shadow">Login</button>
          </Link>
          <Link href="/auth/register" className="w-full">
            <button className="w-full py-3 rounded-lg bg-black hover:bg-zinc-800 text-white text-lg font-semibold shadow">Create Account</button>
          </Link>
        </div>
      </main>
    </div>
  );
  
}
