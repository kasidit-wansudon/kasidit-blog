'use client';

// Comment in English
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/admin/posts');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        <h1 className="mb-4 text-xl font-semibold">Admin login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1 text-sm">
            <label className="text-slate-300">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 text-sm">
            <label className="text-slate-300">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-sky-500 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
